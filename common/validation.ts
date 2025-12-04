export function validateAndTrimString(str: string, label: string, minLength: number, maxLength: number): string {
    if (typeof str != "string") throw new Error(`Argument '${label}' must be a string`);
    str = str.trim();
    if (str.length <= 0) throw new Error(`Argument '${label}' must not be empty`);
    if (minLength && str.length < minLength) throw new Error(`Argument '${label}' must be at least ${minLength} chars long`);
    if (maxLength && str.length > maxLength) throw new Error(`Argument '${label}' must be at most ${maxLength} chars long`);
    return str;
}

export function validateFirstName(name: string) {
    name = validateAndTrimString(name, "first name", 1, 30);
    const regex = /^[A-z'-]+$/;
    if (!regex.test(name)) throw new Error("Invalid first name");
    return name;
}

export function validateLastName(name: string) {
    name = validateAndTrimString(name, "last name", 1, 30);
    const regex = /^[A-z'-]+$/;
    if (!regex.test(name)) throw new Error("Invalid last name");
    return name;
}

export function validateEmail(email: string) {
    email = validateAndTrimString(email, "email", 3, 100);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) throw new Error("Invalid email");
    return email;
}

export function validatePassword(password: string) {
    if (typeof(password) != "string") throw new Error("Password must be a string");
    if (password.length < 8) throw new Error("Password should be at least 8 characters");
    if (!/[a-z]/.test(password)) throw new Error("Password must contain a lowercase letter");
    if (!/[A-Z]/.test(password)) throw new Error("Password must contain an uppercase letter");
    if (!/[0-9]/.test(password)) throw new Error("Password must contain a number");
    if (/^[A-z0-9]*$/.test(password)) throw new Error("Password must contain a special character");
    return password;
}

export function validateStrAsObjectId(id: string, label = "ID") {
    id = validateAndTrimString(id, label, 24, 24);
    if (!/^[0-9a-fA-F]{24}$/.test(id)) throw new Error(`${label} does not represent a valid ObjectId string`);
    return id;
}

export function validateStartEndDates(start: Date, end: Date) {
    if (start > end) throw new Error ("Start date of event must be before end date");
    let NOW = new Date();
    if (start < NOW) throw new Error ("Event start date cannot be in the past");
    if (end > NOW) throw new Error ("Event end date cannot be in the past");
    NOW.setFullYear(NOW.getFullYear() + 2);
    if (end > NOW || start > NOW) throw new Error ("You can only schedule events 2 years in advance");
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 900000) throw new Error ("Events must last for at least 15 minutes");
}