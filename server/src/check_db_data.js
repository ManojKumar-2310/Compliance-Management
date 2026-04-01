const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Task = require('./models/Task');
const Mission = require('./models/Mission');
const User = require('./models/User');

dotenv.config();

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const tasks = await Task.find();
        const missions = await Mission.find();
        const users = await User.find();

        console.log('--- TASKS ---');
        console.log(`Total: ${tasks.length}`);
        tasks.forEach(t => console.log(`- ${t.title} (${t.status}) assignedTo: ${t.assignedTo}`));

        console.log('\n--- MISSIONS ---');
        console.log(`Total: ${missions.length}`);
        missions.forEach(m => console.log(`- ${m.missionObjective} (${m.missionStatus}) specialist: ${m.assignedSpecialist?.name}`));

        console.log('\n--- USERS ---');
        console.log(`Total: ${users.length}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
