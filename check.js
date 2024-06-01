import inquirer from 'inquirer';
import chalk from "chalk";
class User {
    username;
    userid;
    password;
    balance;
    constructor(username, userid, password, balance = 0) {
        this.username = username;
        this.userid = userid;
        this.password = password;
        this.balance = balance;
        console.log(password); // Yeh password ko console par print karta hai
    }
    static async Signup() {
        const answers = await inquirer.prompt([
            {
                name: 'username',
                message: 'Enter Your Username :',
                type: 'input'
            },
            {
                name: 'userid',
                message: 'Enter Your User Email-ID :',
                type: 'input'
            },
            {
                name: 'password',
                message: 'Enter Your Password : ',
                type: 'password',
                mask: '.',
                validate: function (input) {
                    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;
                    if (passwordRegex.test(input)) {
                        return true;
                    }
                    else {
                        return 'Password must contain at least one number and one special character.';
                    }
                }
            }
        ]);
        return new User(answers.username, answers.userid, answers.password, 0);
    }
    static async login(savedUsers) {
        const answers = await inquirer.prompt([
            {
                name: 'userid',
                message: 'Enter Your User Email-ID :',
                type: 'input'
            },
            {
                name: 'password',
                message: 'Enter Your Password :',
                type: 'password',
                mask: '*'
            }
        ]);
        const foundUser = savedUsers.find((user) => user.userid === answers.userid && user.password === answers.password);
        if (foundUser) {
            console.log(`Welcome back, ${foundUser.username}! Login successful.`);
            return foundUser;
        }
        else {
            console.log('Login failed: Invalid User ID or Password.');
            return null;
        }
    }
    static async payMent() {
        let paymentType = await inquirer.prompt([
            {
                name: "payment",
                type: "list",
                message: "Select Payment Method",
                choices: ["Bank Transfer", "EasyPaisa", "JazzCash"]
            },
            {
                name: "amount",
                type: "input",
                message: "Enter the amount to transfer:",
                validate: function (value) {
                    const amount = parseFloat(value);
                    if (!isNaN(amount) && amount > 0) {
                        return true;
                    }
                    return "Please enter a valid amount.";
                }
            }
        ]);
        console.log(`\nYou selected ${paymentType.payment} and transferred ${paymentType.amount}`);
    }
    static async viewAndBookEvents(events) {
        if (events.length === 0) {
            console.log('No events available.');
            return;
        }
        const { eventIndex } = await inquirer.prompt([
            {
                name: 'eventIndex',
                message: 'Select an event to book:',
                type: 'list',
                choices: events.map((event, index) => ({ name: event, value: index }))
            }
        ]);
        console.log(`You have booked: ${events[eventIndex]}`);
        const { confirmBooking } = await inquirer.prompt([
            {
                name: 'confirmBooking',
                message: 'Do you want to proceed with the booking?',
                type: 'confirm'
            }
        ]);
        if (confirmBooking) {
            await User.payMent();
            console.log(chalk.bold.bgRedBright("Your Ticket now is completed"));
            console.log("your Ticket has come throuh email");
        }
    }
}
class Admin {
    name;
    password;
    constructor(name, password) {
        this.name = name;
        this.password = password;
    }
    static async login() {
        const answers = await inquirer.prompt([
            {
                name: 'name',
                message: 'Enter Admin Name',
                type: 'input'
            },
            {
                name: 'password',
                message: 'Enter Admin Password',
                type: 'password',
                mask: '*'
            }
        ]);
        if (answers.name === 'Admin' && answers.password === 'Admin123') {
            console.log('Welcome Admin! Login successful.');
            return true;
        }
        else {
            console.log('Login failed: Invalid Admin Name or Password.');
            return false;
        }
    }
    static async createEvents(events) {
        let condition = true;
        while (condition) {
            const addTask = await inquirer.prompt([
                {
                    name: "todo",
                    message: "What event do you want to add with time and date?",
                    type: "input"
                },
                {
                    name: "addMore",
                    message: "Do you want to add more events?",
                    type: "confirm" // This will prompt a yes/no question
                }
            ]);
            events.push(addTask.todo);
            condition = addTask.addMore;
            // Display events as a list
            console.log("\nEvent List:");
            events.forEach((event, index) => {
                console.log(`${index + 1}. ${event}`);
            });
        }
    }
}
(async () => {
    const users = [];
    const events = [];
    let exit = false;
    while (!exit) {
        const { action } = await inquirer.prompt([
            {
                name: 'action',
                message: 'Would you like to Signup, Login, or Exit?',
                type: 'list',
                choices: ['Signup', 'User Login', 'Admin Login', 'Exit']
            }
        ]);
        switch (action) {
            case 'Signup':
                const newUser = await User.Signup();
                users.push(newUser);
                console.log('Signup successful!');
                break;
            case 'User Login':
                if (users.length > 0) {
                    console.log("WELCOME USER");
                    const user = await User.login(users);
                    if (user) {
                        await User.viewAndBookEvents(events);
                    }
                }
                else {
                    console.log('No users available. Please signup first.');
                }
                break;
            case 'Admin Login':
                console.log("WELCOME ADMIN");
                const adminLoggedIn = await Admin.login();
                if (adminLoggedIn) {
                    await Admin.createEvents(events);
                }
                break;
            case 'Exit':
                exit = true;
                break;
        }
    }
})();
