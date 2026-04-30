exports.up = async function (knex) {
    if (!(await knex.schema.hasColumn("monitor_group", "display_name"))) {
        await knex.schema.alterTable("monitor_group", function (table) {
            table.string("display_name", 150);
        });
    }

    await knex("monitor_group").update({
        "display_name": knex("monitor").select("name").whereRaw("monitor.id = monitor_group.monitor_id"),
    });
};

exports.down = async function (knex) {
    if (await knex.schema.hasColumn("monitor_group", "display_name")) {
        await knex.schema.alterTable("monitor_group", function (table) {
            table.dropColumn("display_name");
        });
    }
};
