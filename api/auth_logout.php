<?php
require_once __DIR__ . '/../lib/session.php';
session_unset(); session_destroy(); echo 'OK';
