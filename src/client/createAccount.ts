
import { makeRequest } from "./commonUtils.js";

let isCreatingAccount = false;

const createAccount = async () => {
    const usernameTag = document.getElementById("username") as HTMLInputElement;
    const passwordTag = document.getElementById("password") as HTMLInputElement;
    const passwordConfirmationTag = document.getElementById("passwordConfirmation") as HTMLInputElement;
    const emailAddressTag = document.getElementById("emailAddress") as HTMLInputElement;
    const username = usernameTag.value;
    const password = passwordTag.value;
    const passwordConfirmation = passwordConfirmationTag.value;
    const emailAddress = emailAddressTag.value;
    if (username.length <= 0) {
        alert("Please enter a username.");
        usernameTag.focus();
        return;
    }
    if (password.length <= 0) {
        alert("Please enter a password.");
        passwordTag.focus();
        return;
    }
    if (password !== passwordConfirmation) {
        alert("Password confirmation does not match.");
        passwordConfirmationTag.focus();
        return;
    }
    if (emailAddress.length <= 0) {
        alert("Please enter an email address.");
        emailAddressTag.focus();
        return;
    }
    if (emailAddress.indexOf("@") < 0 || emailAddress.indexOf(".") < 0) {
        alert("Please enter a valid email address.");
        emailAddressTag.focus();
        return;
    }
    await makeRequest("/createAccountAction", { username, password, emailAddress });
    alert("Your account was created successfully.");
    window.location = "/login" as (string & Location);
};

window.submitForm = async () => {
    if (isCreatingAccount) {
        return;
    }
    isCreatingAccount = true;
    const messageTag = document.getElementById("message");
    messageTag.innerHTML = "Creating account...";
    try {
        await createAccount();
    } catch (error) {
        alert(error.message);
    }
    messageTag.innerHTML = "";
    isCreatingAccount = false;
};


