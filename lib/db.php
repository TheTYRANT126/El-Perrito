﻿<?php
$DB_HOST = '127.0.0.1';
$DB_NAME = 'elperrito';
$DB_USER = 'root';
$DB_PASS = '';
$dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";
$options = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];
$pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
