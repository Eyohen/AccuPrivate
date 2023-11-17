module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('Roles', 'name', {
            type: Sequelize.ENUM('ADMIN', 'PARTNER', 'TEAMMEMBER'),
            allowNull: false,
        });

        await queryInterface.sequelize.query(`
        DO $$ 
        BEGIN
          CREATE TYPE "public"."enum_Roles_name" AS ENUM('ADMIN', 'PARTNER', 'TEAMMEMBER');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

        await queryInterface.changeColumn('Roles', 'name', {
            type: 'public.enum_Roles_name',
            unique: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('Roles', 'name', {
            type: Sequelize.STRING, // Change back to the original data type
            allowNull: false,
            unique: false, // Remove the unique constraint
        });

        // Drop the ENUM type
        await queryInterface.sequelize.query(`
          DO $$ 
          BEGIN
            DROP TYPE IF EXISTS "public"."enum_Roles_name";
          EXCEPTION
            WHEN undefined_object THEN null;
          END $$;
        `);
    },
};
