const mysql = require('mysql2/promise');

async function updateLocationTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'smartlock'
  });

  try {
    console.log('Starting locker_locations table update...');

    // Kiểm tra xem các cột đã tồn tại chưa
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'smartlock'
      AND TABLE_NAME = 'locker_locations'
    `);

    const existingColumns = columns.map(col => col.COLUMN_NAME);
    console.log('Existing columns:', existingColumns);

    // Kiểm tra xem các bảng tham chiếu có tồn tại không
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = 'smartlock'
      AND TABLE_NAME IN ('provinces', 'districts', 'wards')
    `);

    const existingTables = tables.map(table => table.TABLE_NAME);
    console.log('Existing reference tables:', existingTables);

    // Kiểm tra các cột trong bảng tham chiếu
    const checkReferenceColumns = async (tableName, columnName) => {
      if (!existingTables.includes(tableName)) {
        console.log(`⚠️  Table ${tableName} does not exist`);
        return false;
      }

      const [refColumns] = await connection.execute(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'smartlock'
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      `, [tableName, columnName]);

      if (refColumns.length === 0) {
        console.log(`⚠️  Column ${columnName} does not exist in table ${tableName}`);
        return false;
      }
      return true;
    };

    // Thêm các cột mới nếu chưa tồn tại
    const columnsToAdd = [
      { name: 'province_id', sql: 'ADD COLUMN province_id INT NULL' },
      { name: 'district_id', sql: 'ADD COLUMN district_id INT NULL' },
      { name: 'ward_id', sql: 'ADD COLUMN ward_id INT NULL' }
    ];

    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        await connection.execute(`ALTER TABLE locker_locations ${column.sql}`);
        console.log(`✅ Added column: ${column.name}`);
      } else {
        console.log(`⚠️  Column ${column.name} already exists`);
      }
    }

    // Thêm foreign key constraints nếu chưa có
    if (await checkReferenceColumns('provinces', 'ProvinceId')) {
      try {
        await connection.execute(`
          ALTER TABLE locker_locations
          ADD CONSTRAINT fk_location_province
          FOREIGN KEY (province_id) REFERENCES provinces(ProvinceId)
        `);
        console.log('✅ Added foreign key constraint for province_id');
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log('⚠️  Foreign key constraint for province_id already exists');
        } else {
          console.log('❌ Error adding province foreign key:', error.message);
        }
      }
    } else {
      console.log('❌ Cannot create foreign key for province_id - reference table/column missing');
    }

    if (await checkReferenceColumns('districts', 'DistrictId')) {
      try {
        await connection.execute(`
          ALTER TABLE locker_locations
          ADD CONSTRAINT fk_location_district
          FOREIGN KEY (district_id) REFERENCES districts(DistrictId)
        `);
        console.log('✅ Added foreign key constraint for district_id');
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log('⚠️  Foreign key constraint for district_id already exists');
        } else {
          console.log('❌ Error adding district foreign key:', error.message);
        }
      }
    } else {
      console.log('❌ Cannot create foreign key for district_id - reference table/column missing');
    }

    if (await checkReferenceColumns('wards', 'WardId')) {
      try {
        await connection.execute(`
          ALTER TABLE locker_locations
          ADD CONSTRAINT fk_location_ward
          FOREIGN KEY (ward_id) REFERENCES wards(WardId)
        `);
        console.log('✅ Added foreign key constraint for ward_id');
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log('⚠️  Foreign key constraint for ward_id already exists');
        } else {
          console.log('❌ Error adding ward foreign key:', error.message);
        }
      }
    } else {
      console.log('❌ Cannot create foreign key for ward_id - reference table/column missing');
    }

    // Hiển thị cấu trúc bảng sau khi cập nhật
    const [updatedColumns] = await connection.execute(`
      DESCRIBE locker_locations
    `);
    
    console.log('\n📋 Updated locker_locations table structure:');
    console.table(updatedColumns);

    console.log('\n🎉 Locker_locations table update completed successfully!');

  } catch (error) {
    console.error('❌ Error updating locker_locations table:', error);
  } finally {
    await connection.end();
  }
}

// Chạy script
updateLocationTable().catch(console.error);
