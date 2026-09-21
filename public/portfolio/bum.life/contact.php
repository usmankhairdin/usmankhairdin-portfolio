<?php
// --- CONFIGURATION --- //
$secretKey = "6LcXA_grAAAAAAY1-JhIkdszxTYGzsUx3pJx1zny"; // From Google reCAPTCHA
$to = "usman.khairdin@gmail.com";       // Replace with your own email
$subject = "New Contact Form Message from Bum.Life";

// --- CHECK CAPTCHA --- //
if (!isset($_POST['g-recaptcha-response'])) {
    die("reCAPTCHA verification failed. Please try again.");
}

$recaptchaResponse = $_POST['g-recaptcha-response'];
$verifyResponse = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=$secretKey&response=$recaptchaResponse");
$responseData = json_decode($verifyResponse);

if (!$responseData->success) {
    die("reCAPTCHA failed. Please try again.");
}

// --- SANITIZE & COLLECT FORM DATA --- //
$name = htmlspecialchars($_POST['name']);
$email = htmlspecialchars($_POST['email']);
$message = htmlspecialchars($_POST['message']);

$body = "You received a new message from the Bum.Life contact form:\n\n";
$body .= "Name: $name\n";
$body .= "Email: $email\n";
$body .= "Message:\n$message\n";

// --- SEND EMAIL --- //
$headers = "From: $name <$email>\r\nReply-To: $email\r\n";

if (mail($to, $subject, $body, $headers)) {
    echo "<h2 style='color: white; text-align: center;'>✅ Message sent successfully!</h2>";
} else {
    echo "<h2 style='color: white; text-align: center;'>❌ Message could not be sent. Please try again later.</h2>";
}
?>