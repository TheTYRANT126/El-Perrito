<?php

namespace Spide\PUelperrito\Database;

use PDO;
use PDOException;
use RuntimeException;

class Connection
{
    /** @var PDO|null */
    private static $instance = null;

    public static function getInstance(array $config = null)
    {
        if (self::$instance instanceof PDO && $config === null) {
            return self::$instance;
        }

        $settings = $config ?? self::loadConfig();

        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=utf8mb4',
            $settings['host'],
            $settings['dbname']
        );

        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        try {
            $pdo = new PDO($dsn, $settings['user'], $settings['pass'], $options);
        } catch (PDOException $exception) {
            throw new RuntimeException('No se pudo establecer conexión con la base de datos', 0, $exception);
        }

        if ($config === null) {
            self::$instance = $pdo;
        }

        return $pdo;
    }

    public static function reset()
    {
        self::$instance = null;
    }

    private static function loadConfig()
    {
        $base = dirname(__DIR__, 2);
        $configPath = $base . '/config.php';

        if (file_exists($configPath)) {
            require_once $configPath;
        }

        return [
            'host' => getenv('DB_HOST') ?: (defined('DB_HOST') ? DB_HOST : '127.0.0.1'),
            'dbname' => getenv('DB_NAME') ?: (defined('DB_NAME') ? DB_NAME : ''),
            'user' => getenv('DB_USER') ?: (defined('DB_USER') ? DB_USER : 'root'),
            'pass' => getenv('DB_PASS') ?: (defined('DB_PASS') ? DB_PASS : ''),
        ];
    }
}
