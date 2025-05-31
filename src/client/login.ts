
import { makeRequest } from "./commonUtils.js";

let isLoggingIn = false;

const logInGuestAccount = async (): Promise<void> => {
    const usernameTag = document.getElementById("guestUsername") as HTMLInputElement;
    const username = usernameTag.value;
    if (username.length <= 0) {
        alert("Please enter a username.");
        usernameTag.focus();
        return;
    }
    await makeRequest("/loginAction", { username });
    window.location = "/game" as (string & Location);
};

const logInPersistentAccount = async (): Promise<void> => {
    const usernameTag = document.getElementById("username") as HTMLInputElement;
    const passwordTag = document.getElementById("password") as HTMLInputElement;
    const username = usernameTag.value;
    const password = passwordTag.value;
    if (username.length <= 0) {
        alert("Please enter your username.");
        usernameTag.focus();
        return;
    }
    if (password.length <= 0) {
        alert("Please enter your password.");
        passwordTag.focus();
        return;
    }
    await makeRequest("/loginAction", { username, password });
    window.location = "/menu" as (string & Location);
};

window.submitGuestAccountForm = async (): Promise<void> => {
    if (isLoggingIn) {
        return;
    }
    isLoggingIn = true;
    const messageTag = document.getElementById("guestAccountMessage");
    messageTag.innerHTML = "Logging in...";
    try {
        await logInGuestAccount();
    } catch (error) {
        alert(error.message);
    }
    messageTag.innerHTML = "";
    isLoggingIn = false;
};

window.submitPersistentAccountForm = async (): Promise<void> => {
    if (isLoggingIn) {
        return;
    }
    isLoggingIn = true;
    const messageTag = document.getElementById("persistentAccountMessage");
    messageTag.innerHTML = "Logging in...";
    try {
        await logInPersistentAccount();
    } catch (error) {
        alert(error.message);
    }
    messageTag.innerHTML = "";
    isLoggingIn = false;
};


