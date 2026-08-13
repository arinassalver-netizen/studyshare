/* =========================================================
   CREATE / PROMOTE ADMIN USER
   Usage:
     node scripts/createAdmin.js <name> <email> <password>

   If a user with that email already exists, this just
   promotes them to admin (password is left untouched).
   Otherwise it creates a brand new admin account.
========================================================= */

require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

async function run() {

    const [name, email, password] = process.argv.slice(2);

    if (!email || !password) {
        console.log("Usage: node scripts/createAdmin.js <name> <email> <password>");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {

        user.role = "admin";
        user.isSuspended = false;

        await user.save();

        console.log(`Existing user "${user.email}" promoted to admin.`);

    } else {

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            name: name || "Admin",
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "admin"
        });

        await user.save();

        console.log(`New admin user created: ${user.email}`);
    }

    await mongoose.disconnect();
    process.exit(0);
}

run().catch(error => {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
});
