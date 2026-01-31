# Migration Guide: From localStorage to Database

## Overview
This guide helps you migrate existing localStorage data to the new database system.

## 🔄 Migration Process

### Step 1: Backup Existing Data
Before migration, backup your existing data:

1. **Export Customers Data:**
   ```javascript
   // In browser console on customers page
   const customers = JSON.parse(localStorage.getItem('customers') || '[]')
   console.log('Customers data:', JSON.stringify(customers, null, 2))
   ```

2. **Export Suppliers Data:**
   ```javascript
   // In browser console on suppliers page
   const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]')
   console.log('Suppliers data:', JSON.stringify(suppliers, null, 2))
   ```

### Step 2: Create User Account
1. Navigate to `/register`
2. Create your account with email, password, and business name
3. Login successfully

### Step 3: Import Data (Manual Process)
After logging in, you can manually recreate your customers and suppliers through the UI, or use the automated import below.

### Step 4: Automated Import (Optional)
Create a temporary import script:

```javascript
// Run this in browser console after logging in
async function importData() {
  // Get existing data from localStorage
  const customers = JSON.parse(localStorage.getItem('customers') || '[]')
  const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]')
  
  console.log(`Found ${customers.length} customers and ${suppliers.length} suppliers`)
  
  // Import customers
  for (const customer of customers) {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      })
      
      if (response.ok) {
        console.log(`✅ Imported customer: ${customer.customerName}`)
      } else {
        console.log(`❌ Failed to import customer: ${customer.customerName}`)
      }
    } catch (error) {
      console.log(`❌ Error importing customer: ${customer.customerName}`, error)
    }
  }
  
  // Import suppliers
  for (const supplier of suppliers) {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplier)
      })
      
      if (response.ok) {
        console.log(`✅ Imported supplier: ${supplier.supplierName}`)
      } else {
        console.log(`❌ Failed to import supplier: ${supplier.supplierName}`)
      }
    } catch (error) {
      console.log(`❌ Error importing supplier: ${supplier.supplierName}`, error)
    }
  }
  
  console.log('🎉 Import process completed!')
}

// Run the import
importData()
```

## 🧹 Cleanup (Optional)
After successful migration, you can clear localStorage:

```javascript
// Clear old localStorage data
localStorage.removeItem('customers')
localStorage.removeItem('suppliers')
localStorage.removeItem('isLoggedIn')
console.log('✅ localStorage cleaned up')
```

## ⚠️ Important Notes

1. **Data Structure Compatibility:** The new system preserves all existing field structures exactly
2. **User Isolation:** Each user account has completely separate data
3. **No Breaking Changes:** Existing UI functionality remains the same
4. **Backup First:** Always backup your data before migration

## 🔧 Troubleshooting

### Import Fails
- Check you're logged in properly
- Verify all required fields are present
- Check browser console for error messages

### Data Missing
- Ensure the import script completed successfully
- Refresh the page to reload data from database
- Check browser network tab for API errors

### Login Issues
- Verify MongoDB is running
- Check environment variables are set correctly
- Clear browser cookies and try again

## 📞 Support

If you encounter issues during migration:
1. Check the browser console for error messages
2. Verify your MongoDB connection
3. Ensure all environment variables are set
4. Contact support with error details

## ✅ Migration Checklist

- [ ] Backup existing data
- [ ] Create user account
- [ ] Test login functionality
- [ ] Import customers data
- [ ] Import suppliers data
- [ ] Verify data integrity
- [ ] Test all CRUD operations
- [ ] Clean up localStorage (optional)
- [ ] Remove migration script (optional)

Your Smart Billing system is now ready with secure authentication and database persistence!
