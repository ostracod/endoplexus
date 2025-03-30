
import { makeRequest } from "./commonUtils.js";

let isChangingPassword = false;

const changePassword = async () => {
    const oldPasswordTag = document.getElementById("oldPassword") as HTMLInputElement;
    const newPasswordTag = document.getElementById("newPassword") as HTMLInputElement;
    const passwordConfirmationTag = document.getElementById("passwordConfirmation") as HTMLInputElement;
    const oldPassword = oldPasswordTag.value;
    const newPassword = newPasswordTag.value;
    const passwordConfirmation = passwordConfirmationTag.value;
    if (oldPassword.length <= 0) {
        alert("Please enter your old password.");
        oldPasswordTag.focus();
        return;
    }
    if (newPassword.length <= 0) {
        alert("Please enter a new password.");
        newPasswordTag.focus();
        return;
    }
    if (newPassword !== passwordConfirmation) {
        alert("Password confirmation does not match.");
        passwordConfirmationTag.focus();
        return;
    }
    await makeRequest("/changePasswordAction", { oldPassword, newPassword });
    alert("Your password was changed successfully.");
    window.location = "/menu" as (string & Location);
};

window.submitForm = async () => {
    if (isChangingPassword) {
        return;
    }
    isChangingPassword = true;
    const messageTag = document.getElementById("message");
    messageTag.innerHTML = "Changing password...";
    try {
        await changePassword();
    } catch (error) {
        alert(error.message);
    }
    messageTag.innerHTML = "";
    isChangingPassword = false;
};


