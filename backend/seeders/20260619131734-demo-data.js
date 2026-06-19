"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const now = new Date();

    const creators = await queryInterface.bulkInsert(
      "creators",
      [
        {
          name: "Alpha Tenant",
          email: "alpha@tenant.com",
          password: hashedPassword,
          createdAt: now,
          updatedAt: now,
        },
        {
          name: "Beta Tenant",
          email: "beta@tenant.com",
          password: hashedPassword,
          createdAt: now,
          updatedAt: now,
        },
      ],
      { returning: ["id"] },
    );

    const creatorIds = creators.map((c) => c.id);

    const programRecords = [];
    creatorIds.forEach((creatorId, index) => {
      const prefix = index === 0 ? "Alpha" : "Beta";
      programRecords.push(
        {
          title: `${prefix} Core Program`,
          creatorId,
          createdAt: now,
          updatedAt: now,
        },
        {
          title: `${prefix} Advanced Mastery`,
          creatorId,
          createdAt: now,
          updatedAt: now,
        },
        {
          title: `${prefix} Elective Module`,
          creatorId,
          createdAt: now,
          updatedAt: now,
        },
      );
    });

    const programs = await queryInterface.bulkInsert(
      "programs",
      programRecords,
      { returning: ["id"] },
    );
    const programIds = programs.map((p) => p.id);

    const sessionRecords = [];
    programIds.forEach((programId, pIdx) => {
      for (let sIdx = 1; sIdx <= 10; sIdx++) {
        sessionRecords.push({
          title: `Program ${pIdx + 1} - Session ${sIdx}`,
          instructorName: `Instructor ${String.fromCharCode(65 + (sIdx % 3))}`, // Cycles instructors A, B, C
          tags: ["test1", "test2"],
          programId,
          position: sIdx,
          createdAt: now,
          updatedAt: now,
        });
      }
    });

    await queryInterface.bulkInsert("sessions", sessionRecords, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("sessions", null, {});
    await queryInterface.bulkDelete("programs", null, {});
    await queryInterface.bulkDelete("creators", null, {});
  },
};
