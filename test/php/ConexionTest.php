<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use Spide\PUelperrito\Database\Connection;

final class ConexionTest extends TestCase
{
    public function testGetInstanceReturnsSameInstanceWhenCalledMultipleTimes(): void
    {
        $mockPDO = $this->createMock(\PDO::class);
        
        $reflection = new \ReflectionClass(Connection::class);
        $property = $reflection->getProperty('instance');
        $property->setAccessible(true);
        $property->setValue($mockPDO);

        $instance1 = Connection::getInstance();
        $instance2 = Connection::getInstance();

        $this->assertSame($instance1, $instance2);
    }

    public function testGetInstanceThrowsRuntimeExceptionOnConnectionFailure(): void
    {
        $config = [
            'host' => 'invalid_host',
            'dbname' => 'invalid_db',
            'user' => 'invalid_user',Z
            'pass' => 'invalid_pass'
        ];

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('No se pudo establecer conexión con la base de datos');

        Connection::getInstance($config);
    }

    protected function tearDown(): void
    {
        Connection::reset();
        parent::tearDown();
    }
}
