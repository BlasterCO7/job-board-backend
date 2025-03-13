import pool from './db.js'

const insertData= async () => { 
    try{
        const query = `
        INSERT INTO jobs (title,company,location,experience,apply_link) VALUES ('Software Engineer', 'Microsoft','Remote' ,'0+ years', 'https://microsoft.com/jobs' );`;
        await pool.query(query)
        console.log("Sample job inserted!")

    } catch (err){
        console.error("Error inserting data:",err.message);
    }
};

insertData()