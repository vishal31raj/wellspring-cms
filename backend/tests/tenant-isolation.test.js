const request = require("supertest");
const app = require("../app");
const Program = require("../models/program.model");
const Creator = require("../models/creator.model");
const sequelize = require("../utils/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function createTenant() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const uniqueEmail = `tenant_${Math.random().toString(36).substring(7)}@test.com`;

  return await Creator.create({
    name: "Test Tenant",
    email: uniqueEmail,
    password: hashedPassword,
  });
}

function generateToken(tenantInstance) {
  return jwt.sign(
    {
      creatorId: tenantInstance.id,
      email: tenantInstance.email,
    },
    process.env.JWT_SECRET || "fallback_secret_for_testing",
    { expiresIn: "1h" },
  );
}

describe("Tenant Isolation Constraints", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test("rejects cross-tenant program access", async () => {
    const tenantA = await createTenant();
    const tenantB = await createTenant();
    const program = await Program.create({
      title: "Program B",
      creatorId: tenantB.id,
    });
    const tokenA = generateToken(tenantA);

    const res = await request(app)
      .get(`/programs/${program.id}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .set("t_id", tenantA.id.toString());

    expect([403, 404]).toContain(res.statusCode);
  });

  test("rejects cross-tenant session creation", async () => {
    const tenantA = await createTenant();
    const tenantB = await createTenant();
    const programB = await Program.create({
      title: "Program B",
      creatorId: tenantB.id,
    });
    const tokenA = generateToken(tenantA);

    const res = await request(app)
      .post(`/programs/${programB.id}/sessions`)
      .set("Authorization", `Bearer ${tokenA}`)
      .set("t_id", tenantA.id.toString())
      .send({ title: "Hacked Session", instructorName: "Evil" });

    expect([403, 404]).toContain(res.statusCode);
  });

  test("rejects cross-tenant program update", async () => {
    const tenantA = await createTenant();
    const tenantB = await createTenant();
    const programB = await Program.create({
      title: "Original",
      creatorId: tenantB.id,
    });
    const tokenA = generateToken(tenantA);

    const res = await request(app)
      .put(`/programs/${programB.id}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .set("t_id", tenantA.id.toString())
      .send({ title: "Compromised" });

    expect([403, 404]).toContain(res.statusCode);
  });

  test("rejects cross-tenant program deletion", async () => {
    const tenantA = await createTenant();
    const tenantB = await createTenant();
    const programB = await Program.create({
      title: "To Be Deleted",
      creatorId: tenantB.id,
    });
    const tokenA = generateToken(tenantA);

    const res = await request(app)
      .delete(`/programs/${programB.id}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .set("t_id", tenantA.id.toString());

    expect([403, 404]).toContain(res.statusCode);
  });
});
