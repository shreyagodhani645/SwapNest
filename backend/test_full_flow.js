// Full end-to-end API test for SwapNest
const API = 'http://localhost:5000/api';

async function testAPI() {
    console.log('=== SwapNest Full API Test ===\n');
    let aliceToken, bobToken, aliceId, bobId, listingId, offerId;

    // 1. Signup Alice
    console.log('1. Signup Alice...');
    let res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'TestAlice', email: 'testalice@test.com', password: 'test123' })
    });
    let data = await res.json();
    console.log(`   Status: ${res.status}, Message: ${data.message}`);
    if (res.status !== 201) { console.log('   FAIL - signup failed'); return; }

    // 2. Login Alice
    console.log('2. Login Alice...');
    res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'testalice@test.com', password: 'test123' })
    });
    data = await res.json();
    aliceToken = data.token;
    aliceId = data.user.id;
    console.log(`   Status: ${res.status}, User ID: ${aliceId}, Username: ${data.user.username}`);

    // 3. Create a listing (without image, using FormData)
    console.log('3. Create listing...');
    const formData = new URLSearchParams();
    formData.append('title', 'Test iPhone 14 Pro');
    formData.append('description', 'Brand new iPhone for testing');
    formData.append('price', '75000');
    formData.append('location', 'Mumbai');
    formData.append('condition', 'New');
    formData.append('categoryId', '1'); // will try with 1 first

    // First check categories
    res = await fetch(`${API}/listings/categories`);
    const cats = await res.json();
    console.log(`   Available categories: ${JSON.stringify(cats.map(c => c.NAME))}`);
    
    // If no categories, create one
    let catId;
    if (cats.length === 0) {
        console.log('   No categories found. Creating one...');
        res = await fetch(`${API}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Electronics' })
        });
        const catData = await res.json();
        catId = catData.id;
        console.log(`   Created category: Electronics (ID: ${catId})`);
    } else {
        catId = cats[0].ID;
    }

    // Create listing via multipart form data  
    res = await fetch(`${API}/listings`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${aliceToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `title=Test+iPhone+14+Pro&description=Brand+new+iPhone&price=75000&location=Mumbai&condition=New&categoryId=${catId}`
    });
    data = await res.json();
    console.log(`   Status: ${res.status}, Response: ${JSON.stringify(data)}`);
    if (res.status === 201) {
        listingId = data.id;
        console.log(`   ✅ Listing created! ID: ${listingId}`);
    } else {
        console.log(`   ❌ Listing creation FAILED`);
        return;
    }

    // 4. Get listing details
    console.log('4. Get listing details...');
    res = await fetch(`${API}/listings/${listingId}`);
    data = await res.json();
    console.log(`   Status: ${res.status}, Title: ${data.TITLE}, Seller: ${data.SELLER_NAME}, Seller ID: ${data.SELLER_ID}`);

    // 5. Get seller profile (this was crashing before)
    console.log('5. Get seller profile...');
    res = await fetch(`${API}/users/profile/${data.SELLER_ID}`);
    data = await res.json();
    console.log(`   Status: ${res.status}, Username: ${data.USERNAME}, Trust: ${data.TRUST_SCORE}, Listings: ${data.LISTINGS_COUNT}`);
    if (res.status === 200) {
        console.log(`   ✅ Seller profile works!`);
    } else {
        console.log(`   ❌ Seller profile FAILED`);
    }

    // 6. Signup & Login Bob
    console.log('6. Signup Bob...');
    res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'TestBob', email: 'testbob@test.com', password: 'test123' })
    });
    console.log(`   Signup status: ${res.status}`);
    
    res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'testbob@test.com', password: 'test123' })
    });
    data = await res.json();
    bobToken = data.token;
    bobId = data.user.id;
    console.log(`   Login status: ${res.status}, Bob ID: ${bobId}`);

    // 7. Bob makes an offer
    console.log('7. Bob makes an offer...');
    res = await fetch(`${API}/offers`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${bobToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId, amount: 60000 })
    });
    data = await res.json();
    console.log(`   Status: ${res.status}, Message: ${data.message}`);
    if (res.status === 201) console.log(`   ✅ Offer created!`);
    else console.log(`   ❌ Offer FAILED`);

    // 8. Bob adds to wishlist
    console.log('8. Bob adds to wishlist...');
    res = await fetch(`${API}/wishlist`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${bobToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId })
    });
    data = await res.json();
    console.log(`   Status: ${res.status}, Message: ${data.message}`);

    // 9. Check wishlist
    console.log('9. Check wishlist...');
    res = await fetch(`${API}/wishlist/check/${listingId}`, {
        headers: { 'Authorization': `Bearer ${bobToken}` }
    });
    data = await res.json();
    console.log(`   Status: ${res.status}, Is Wishlisted: ${data.isWishlisted}`);

    // 10. Bob sends a chat message
    console.log('10. Bob sends chat message...');
    res = await fetch(`${API}/chat/send`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${bobToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, receiverId: aliceId, content: 'Hi, is this still available?' })
    });
    data = await res.json();
    console.log(`   Status: ${res.status}, Message: ${data.message}`);
    if (res.status === 201) console.log(`   ✅ Chat message sent!`);
    else console.log(`   ❌ Chat FAILED`);

    // 11. Get chat conversation
    console.log('11. Get conversation...');
    res = await fetch(`${API}/chat/conversation?listingId=${listingId}&otherUserId=${aliceId}`, {
        headers: { 'Authorization': `Bearer ${bobToken}` }
    });
    data = await res.json();
    console.log(`   Status: ${res.status}, Messages: ${data.length}`);
    if (res.status === 200 && data.length > 0) console.log(`   ✅ Chat conversation works!`);
    else console.log(`   ❌ Chat conversation FAILED`);

    // 12. Alice gets inbox
    console.log('12. Alice gets inbox...');
    res = await fetch(`${API}/chat/inbox`, {
        headers: { 'Authorization': `Bearer ${aliceToken}` }
    });
    data = await res.json();
    console.log(`   Status: ${res.status}, Inbox items: ${data.length}`);

    // 13. Alice sees offers on her listings
    console.log('13. Alice checks offers...');
    res = await fetch(`${API}/offers/my-listings`, {
        headers: { 'Authorization': `Bearer ${aliceToken}` }
    });
    data = await res.json();
    console.log(`   Status: ${res.status}, Offers: ${data.length}`);
    if (data.length > 0) {
        offerId = data[0].ID;
        console.log(`   Offer ID: ${offerId}, Amount: ${data[0].AMOUNT}, Status: ${data[0].STATUS}`);
    }

    // 14. Alice accepts the offer
    console.log('14. Alice accepts offer...');
    res = await fetch(`${API}/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${aliceToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' })
    });
    data = await res.json();
    console.log(`   Status: ${res.status}, Message: ${data.message}`);
    if (res.status === 200) console.log(`   ✅ Offer accepted!`);
    else console.log(`   ❌ Offer accept FAILED`);

    // 15. Check listing status changed to reserved
    console.log('15. Check listing status...');
    res = await fetch(`${API}/listings/${listingId}`);
    data = await res.json();
    console.log(`   Status: ${data.STATUS}`);
    if (data.STATUS === 'reserved') console.log(`   ✅ Listing auto-reserved!`);
    else console.log(`   ⚠️  Listing status is: ${data.STATUS}`);

    // 16. Mark as sold
    console.log('16. Mark listing as sold...');
    res = await fetch(`${API}/listings/${listingId}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${aliceToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sold' })
    });
    data = await res.json();
    console.log(`   Status: ${res.status}, Message: ${data.message}`);
    if (res.status === 200) console.log(`   ✅ Listing marked as sold!`);
    else console.log(`   ❌ Mark sold FAILED`);

    // 17. Remove from wishlist
    console.log('17. Remove from wishlist...');
    res = await fetch(`${API}/wishlist/${listingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${bobToken}` }
    });
    data = await res.json();
    console.log(`   Status: ${res.status}, Message: ${data.message}`);

    // 18. Bob checks sent offers
    console.log('18. Bob checks sent offers...');
    res = await fetch(`${API}/offers/my-sent`, {
        headers: { 'Authorization': `Bearer ${bobToken}` }
    });
    data = await res.json();
    console.log(`   Status: ${res.status}, Offers: ${data.length}`);
    if (data.length > 0) console.log(`   Offer status: ${data[0].STATUS}`);

    // 19. Get all listings (home page)
    console.log('19. Get all listings...');
    res = await fetch(`${API}/listings`);
    data = await res.json();
    console.log(`   Status: ${res.status}, Active listings: ${data.length}`);

    // 20. Get listings including sold
    console.log('20. Get all listings (including sold)...');
    res = await fetch(`${API}/listings?showSold=true`);
    data = await res.json();
    console.log(`   Status: ${res.status}, Total listings: ${data.length}`);

    console.log('\n=== TEST COMPLETE ===');
}

testAPI().catch(err => console.error('Test error:', err));
