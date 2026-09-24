const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🚀 Starting ACIMS Backend API Test Suite (Native fetch)...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    console.log('--- Test 1: Health Check ---');
    const healthRes = await fetch(`${BASE_URL}/health`).then((r) => r.json());
    assert(healthRes.status === 'OK', 'Health check returns status OK');

    // 2. Authentication - Lecturer
    console.log('\n--- Test 2: Authentication (Login as Lecturer) ---');
    const lecLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'thanawat', password: 'password123' }),
    }).then((r) => r.json());
    assert(lecLogin.success === true, 'Lecturer login success');
    assert(lecLogin.user.roles.includes('lecturer'), 'User has lecturer role');
    const lecturerToken = lecLogin.token;

    // 3. Authentication - Head of Curriculum (CS)
    console.log('\n--- Test 3: Authentication (Login as Head of CS) ---');
    const csHeadLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'somchai', password: 'password123' }),
    }).then((r) => r.json());
    assert(csHeadLogin.user.roles.includes('curriculum_head'), 'User has curriculum_head role');
    const headToken = csHeadLogin.token;

    // 4. Authentication - Admin
    console.log('\n--- Test 4: Authentication (Login as Admin) ---');
    const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password123' }),
    }).then((r) => r.json());
    assert(adminLogin.user.roles.includes('admin'), 'User has admin role');
    const adminToken = adminLogin.token;

    // 5. Negative Test: Wrong Password
    console.log('\n--- Test 5: Login with Wrong Password (Negative Test) ---');
    const wrongPassRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrongpassword' }),
    });
    assert(wrongPassRes.status === 400, 'Returns 400 for wrong password');

    // 6. Lecturer: Get My Works (Table 3.10 TC001, TC007)
    console.log('\n--- Test 6: Lecturer Get My Works ---');
    const myWorksRes = await fetch(`${BASE_URL}/works/my-works`, {
      headers: { Authorization: `Bearer ${lecturerToken}` },
    }).then((r) => r.json());
    assert(myWorksRes.success === true, 'Successfully fetched lecturer works');
    console.log(`  Found ${myWorksRes.works.length} works for lecturer 'thanawat'`);

    // 7. Head of Curriculum: Get Curriculum Works (Table 3.12 TC001)
    console.log('\n--- Test 7: Head of Curriculum Get Works to Review ---');
    const currWorksRes = await fetch(`${BASE_URL}/works/curriculum-works`, {
      headers: { Authorization: `Bearer ${headToken}` },
    }).then((r) => r.json());
    assert(currWorksRes.success === true, 'Head successfully retrieved pending works');

    // 8. Department Head / Admin: Get Department Dashboard Stats (Figure 3.10)
    console.log('\n--- Test 8: Get Department Stats (Dashboard Summary Cards) ---');
    const statsRes = await fetch(`${BASE_URL}/stats/department`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    assert(statsRes.success === true, 'Department stats retrieved successfully');
    assert(statsRes.summary.total > 0, `Total works in department: ${statsRes.summary.total}`);
    assert(statsRes.byType.length > 0, 'Breakdown by work type available');

    // 9. Negative Test: Lecturer accessing Admin endpoint (Table 3.10 TC004)
    console.log('\n--- Test 9: Role Security (Lecturer accessing Admin route) ---');
    const forbiddenRes = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${lecturerToken}` },
    });
    assert(forbiddenRes.status === 403, 'Returns 403 Forbidden for unauthorized role');

    // 10. Admin: Get Users List (Table 3.14 TC007)
    console.log('\n--- Test 10: Admin Get Users List ---');
    const usersRes = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    assert(usersRes.success === true && usersRes.users.length >= 6, 'Admin fetched users successfully');

    // 11. Workflow: Curriculum Head Reviewing a Work (Table 3.13 TC001, TC004)
    console.log('\n--- Test 11: Workflow Review Test (Approve & Validation) ---');
    // 11a. Test returning without comments (Should fail - TC004 Table 3.13)
    const returnNoCommentRes = await fetch(`${BASE_URL}/works/2/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${headToken}`,
      },
      body: JSON.stringify({ action: 'return', comments: '' }),
    });
    assert(returnNoCommentRes.status === 400, 'Returns 400 when return comments missing (TC004)');

    // 11b. Test approving a work (TC001 Table 3.13)
    const approveRes = await fetch(`${BASE_URL}/works/2/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${headToken}`,
      },
      body: JSON.stringify({ action: 'approve' }),
    }).then((r) => r.json());
    assert(approveRes.success === true && approveRes.status === 'อนุมัติแล้ว', 'Successfully approved work 2');

    // 12. Admin: Change User Role (Table 3.15 TC001, TC003)
    console.log('\n--- Test 12: Admin Change User Role (Table 3.15) ---');
    const changeRoleRes = await fetch(`${BASE_URL}/users/6/roles`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ role_ids: [3, 4] }),
    }).then((r) => r.json());
    assert(changeRoleRes.success === true, 'Successfully updated user 6 roles');
    assert(changeRoleRes.roles.includes('curriculum_head'), 'User 6 now has curriculum_head role');

    console.log(`\n=========================================`);
    console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`=========================================\n`);

    if (failed === 0) {
      console.log('🎉 ALL BACKEND TESTS PASSED 100%!');
    }
  } catch (error) {
    console.error('Test execution error:', error.message);
  }
}

runTests();
