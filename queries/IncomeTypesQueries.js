import db from './../db/index'

const Queries = {
    selectAllIncomesTypesQuery(req) {
        const selectAll = `
            with maintable as (
                SELECT
                    category_default.name as category,
                    json_object_agg(subcategory_default.name, json_build_object('id', assigned_to_user.id)) as subcategoryData
                FROM budget.incomes_category_assigned_to_user assigned_to_user
                    LEFT OUTER JOIN budget.incomes_categories_config_default config_default on assigned_to_user.connected_cat_id = config_default.id
                    LEFT OUTER JOIN budget.incomes_subcategory_default subcategory_default on config_default.subcategory_id = subcategory_default.id
                    LEFT OUTER JOIN budget.incomes_category_default category_default on config_default.category_id = category_default.id
                WHERE assigned_to_user.user_id=$1
                GROUP BY category_default.name
            )

            groupedSubcategories as (
                SELECT
                category,
                json_object_agg('subcategories', subcategoryData) as subcategories
                FROM maintable
                group by category
            )

            SELECT
                json_object_agg(category, subcategories) as categories
            FROM groupedSubcategories
            `;
        const queryValues = [req.user.id]
        return db.query(selectAll, queryValues)
    },

    addOneIncomeTypeQuery(req){
        const addQuery = 'INSERT INTO budget.incomes_category_assigned_to_user VALUES (DEFAULT, $1, $2) RETURNING *'
        const queryValues = [
            req.user.id,
            req.body.name
        ]
        return db.query(addQuery, queryValues)
    },

    selectIncomeTypeQuery(req) {
        const selectQuery = 'SELECT * FROM budget.incomes_category_assigned_to_user WHERE id = $1'
        const queryValues = [req.params.id]
        return db.query(selectQuery, queryValues)
    },

    updateIncomeQuery(req) {
        const updateQuery = 'UPDATE budget.incomes_category_assigned_to_user SET name = $1 WHERE id = $2'
        const queryValues = [
            req.body.name,
            req.params.id
        ]
        return db.query(updateQuery, queryValues)
    },

    deleteIncomeQuery(req) {
        const deleteQuery = 'DELETE FROM budget.incomes_category_assigned_to_user WHERE id = $1'
        const queryValues = [req.params.id]
        return db.query(deleteQuery, queryValues)
    }
}

export default Queries