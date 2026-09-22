<?php
// Legacy Bum.Life contact handler. The server secret must be configured outside the public repository.
$secretKey = getenv('BUM_LIFE_RECAPTCHA_SECRET');
$to = 'brief@usmankhairdin.com';
$subject = 'New Contact Form Message from Bum.Life';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die('Method not allowed.');
}

if (!$secretKey) {
    http_response_code(503);
    die('Contact form is temporarily unavailable.');
}

$recaptchaResponse = trim($_POST['g-recaptcha-response'] ?? '');
if ($recaptchaResponse === '') {
    http_response_code(400);
    die('reCAPTCHA verification failed. Please try again.');
}

$verificationContext = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
        'content' => http_build_query([
            'secret' => $secretKey,
            'response' => $recaptchaResponse,
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ]),
        'timeout' => 8,
    ],
]);
$verifyResponse = @file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $verificationContext);
$responseData = $verifyResponse === false ? null : json_decode($verifyResponse);

if (!$responseData || empty($responseData->success)) {
    http_response_code(400);
    die('reCAPTCHA failed. Please try again.');
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    die('Please provide a valid name, email address and message.');
}

$name = substr(str_replace(["\r", "\n"], ' ', $name), 0, 120);
$email = substr(str_replace(["\r", "\n"], '', $email), 0, 254);
$message = substr($message, 0, 5000);

$body = "You received a new message from the Bum.Life contact form:\n\n";
$body .= "Name: $name\n";
$body .= "Email: $email\n";
$body .= "Message:\n$message\n";
$headers = "From: Bum.Life website <brief@usmankhairdin.com>\r\nReply-To: $email\r\n";

if (mail($to, $subject, $body, $headers)) {
    echo "<h2 style='color: white; text-align: center;'>Message sent successfully.</h2>";
} else {
    http_response_code(500);
    echo "<h2 style='color: white; text-align: center;'>Message could not be sent. Please try again later.</h2>";
}
?>
