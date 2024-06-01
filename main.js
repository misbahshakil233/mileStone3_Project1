import inquirer from 'inquirer';
import chalk from 'chalk';
console.log(chalk.bold.blueBright("---------------WELCOME TO NEW PROJECT---------------- "));
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
                        return chalk.blue('Password must contain at least one number and one special character.');
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
            console.log(chalk.blue(`Welcome back, ${foundUser.username}! Login successful.`));
            return foundUser;
        }
        else {
            console.log(chalk.red('Login failed: Invalid User ID or Password.'));
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
            console.log(chalk.red('No events available.'));
            return;
        }
        const { eventIndex } = await inquirer.prompt([
            {
                name: 'eventIndex',
                message: 'Select an event to book:',
                type: 'list',
                choices: events.map((event, index) => ({ name: `${event.name} (Seats available: ${event.seats})`, value: index }))
            }
        ]);
        const selectedEvent = events[eventIndex];
        const { seatCount } = await inquirer.prompt([
            {
                name: 'seatCount',
                message: `Enter the number of seats you want to book for ${selectedEvent.name} (Available: ${selectedEvent.seats}):`,
                type: 'input',
                validate: function (value) {
                    const seatCount = parseInt(value);
                    if (!isNaN(seatCount) && seatCount > 0 && seatCount <= selectedEvent.seats) {
                        return true;
                    }
                    return `Please enter a valid number of seats (1-${selectedEvent.seats}).`;
                }
            }
        ]);
        if (seatCount > selectedEvent.seats) {
            console.log(chalk.red('Not enough seats available.'));
            return;
        }
        selectedEvent.seats -= seatCount;
        const { confirmBooking } = await inquirer.prompt([
            {
                name: 'confirmBooking',
                message: 'Do you want to proceed with the booking?',
                type: 'confirm'
            }
        ]);
        if (confirmBooking) {
            await User.payMent();
            console.log(chalk.bold.bgRedBright("Your Ticket booking is completed"));
            console.log(chalk.bgCyan.bold("You will receive your ticket via email"));
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
            console.log(chalk.green('Welcome Admin! Login successful.'));
            return true;
        }
        else {
            console.log(chalk.red('Login failed: Invalid Admin Name or Password.'));
            return false;
        }
    }
    static async manageEvents(events) {
        let condition = true;
        while (condition) {
            const options = ["Create Event", "Edit Event", "Delete Event", "Exit"];
            const { choice } = await inquirer.prompt([
                {
                    name: "choice",
                    message: "Choose an option:",
                    type: "list",
                    choices: options
                }
            ]);
            switch (choice) {
                case "Create Event":
                    await Admin.createEvent(events);
                    break;
                case "Edit Event":
                    await Admin.editEvent(events);
                    break;
                case "Delete Event":
                    await Admin.deleteEvent(events);
                    break;
                case "Exit":
                    condition = false;
                    break;
            }
            // Display events as a list
            console.log("\nEvent List:");
            events.forEach((event, index) => {
                console.log(`${index + 1}. ${event.name} (Seats available: ${event.seats})`);
            });
        }
    }
    static async createEvent(events) {
        const addTask = await inquirer.prompt([
            {
                name: "name",
                message: "What event do you want to add with time and date?",
                type: "input",
                validate: function (value) {
                    if (value.trim() === "") {
                        return "Please enter a non-empty string.";
                    }
                    return true;
                }
            },
            {
                name: "seats",
                message: "Enter the number of available seats:",
                type: "input",
                validate: function (value) {
                    const seats = parseInt(value);
                    if (!isNaN(seats) && seats > 0) {
                        return true;
                    }
                    return "Please enter a valid number of seats.";
                }
            }
        ]);
        events.push({ name: addTask.name, seats: addTask.seats });
    }
    static async editEvent(events) {
        if (events.length === 0) {
            console.log(chalk.red('No events available to edit.'));
            return;
        }
        const { eventIndex } = await inquirer.prompt([
            {
                name: 'eventIndex',
                message: 'Select an event to edit:',
                type: 'list',
                choices: events.map((event, index) => ({ name: event.name, value: index }))
            }
        ]);
        const selectedEvent = events[eventIndex];
        const { newName, newSeats } = await inquirer.prompt([
            {
                name: 'newName',
                message: `Enter the new name for ${selectedEvent.name} (leave empty to keep the current name):`,
                type: 'input'
            },
            {
                name: 'newSeats',
                message: `Enter the new number of available seats for ${selectedEvent.name} (current: ${selectedEvent.seats}):`,
                type: 'input',
                validate: function (value) {
                    if (value.trim() === "") {
                        return true;
                    }
                    const seats = parseInt(value);
                    if (!isNaN(seats) && seats > 0) {
                        return true;
                    }
                    return "Please enter a valid number of seats.";
                }
            }
        ]);
        if (newName.trim() !== "") {
            selectedEvent.name = newName;
        }
        if (newSeats.trim() !== "") {
            selectedEvent.seats = parseInt(newSeats);
        }
    }
    static async deleteEvent(events) {
        if (events.length === 0) {
            console.log(chalk.red('No events available to delete.'));
            return;
        }
        const { eventIndex } = await inquirer.prompt([
            {
                name: 'eventIndex',
                message: 'Select an event to delete:',
                type: 'list',
                choices: events.map((event, index) => ({ name: event.name, value: index }))
            }
        ]);
        const { confirmDelete } = await inquirer.prompt([
            {
                name: 'confirmDelete',
                message: `Are you sure you want to delete the event ${events[eventIndex].name}?`,
                type: 'confirm'
            }
        ]);
        if (confirmDelete) {
            events.splice(eventIndex, 1);
            console.log(chalk.green('Event deleted successfully.'));
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
                console.log(chalk.green('Signup successful!'));
                break;
            case 'User Login':
                if (users.length > 0) {
                    console.log(chalk.bold("WELCOME USER"));
                    const user = await User.login(users);
                    if (user) {
                        await User.viewAndBookEvents(events);
                    }
                }
                else {
                    console.log(chalk.red('No users available. Please signup first.'));
                }
                break;
            case 'Admin Login':
                console.log(chalk.bold("WELCOME ADMIN"));
                const adminLoggedIn = await Admin.login();
                if (adminLoggedIn) {
                    await Admin.manageEvents(events);
                }
                break;
            case 'Exit':
                exit = true;
                break;
        }
    }
})();
