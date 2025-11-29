# API Service - Panduan Penggunaan

## 📚 Daftar Isi
- [Setup](#setup)
- [Authentication](#authentication)
- [Products](#products)
- [Employees](#employees)
- [Transactions](#transactions)
- [Error Handling](#error-handling)

## Setup

API sudah dikonfigurasi untuk connect ke backend di `http://10.0.2.2:3001` (untuk Android emulator).

### Import API Services

```typescript
import { authApi, productApi, employeeApi, transactionApi } from '@/services';
```

## Authentication

### Login

```typescript
import { authApi } from '@/services';

try {
  // Login dengan phone
  const result = await authApi.login('081234567890', '123456', true);
  console.log('Login success:', result);
  // Token otomatis tersimpan di AsyncStorage
  // Token otomatis ditambahkan ke semua request berikutnya
  
  // Login dengan email
  const result2 = await authApi.login('user@example.com', '123456', false);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

**Parameter:**
- `credential`: Phone number atau email
- `pin`: PIN user (minimal 6 karakter)
- `isPhone`: `true` untuk login dengan phone, `false` untuk email (default: `true`)

**Note:** `device_id` akan di-generate otomatis oleh API service.

### Register

```typescript
try {
  const result = await authApi.register({
    name: 'John Doe',
    phone: '081234567890',
    email: 'john@example.com',
    password: 'password123',
    businessName: 'Toko Saya',
  });
  console.log('Register success:', result);
} catch (error) {
  console.error('Register failed:', error.message);
}
```

### Logout

```typescript
await authApi.logout();
// Token otomatis dihapus dari AsyncStorage
```

### Check Authentication Status

```typescript
const isLoggedIn = authApi.isAuthenticated();
if (isLoggedIn) {
  console.log('User is logged in');
}
```

### Get User Profile

```typescript
try {
  const result = await authApi.getProfile();
  console.log('User profile:', result.data);
} catch (error) {
  console.error('Failed to get profile:', error.message);
}
```

## Products

### Get All Products

```typescript
import { productApi } from '@/services';

try {
  const result = await productApi.getProducts({
    page: 1,
    limit: 20,
    search: 'kopi',
    category: 'minuman',
  });
  console.log('Products:', result.data);
} catch (error) {
  console.error('Failed to get products:', error.message);
}
```

### Get Product by ID

```typescript
try {
  const result = await productApi.getProduct(1);
  console.log('Product:', result.data);
} catch (error) {
  console.error('Failed to get product:', error.message);
}
```

### Create Product

```typescript
try {
  const result = await productApi.createProduct({
    name: 'Kopi Susu',
    sku: 'KOP-001',
    barcode: '1234567890123',
    price: 15000,
    capitalPrice: 8000,
    stock: 100,
    unit: 'cup',
    category: 'minuman',
    description: 'Kopi susu segar',
  });
  console.log('Product created:', result.data);
} catch (error) {
  console.error('Failed to create product:', error.message);
}
```

### Update Product

```typescript
try {
  const result = await productApi.updateProduct(1, {
    price: 18000,
    stock: 150,
  });
  console.log('Product updated:', result.data);
} catch (error) {
  console.error('Failed to update product:', error.message);
}
```

### Delete Product

```typescript
try {
  await productApi.deleteProduct(1);
  console.log('Product deleted');
} catch (error) {
  console.error('Failed to delete product:', error.message);
}
```

### Update Stock

```typescript
try {
  // Tambah stock
  await productApi.updateStock(1, 50, 'add');
  
  // Kurangi stock
  await productApi.updateStock(1, 10, 'subtract');
} catch (error) {
  console.error('Failed to update stock:', error.message);
}
```

### Search by Barcode

```typescript
try {
  const result = await productApi.searchByBarcode('1234567890123');
  console.log('Product found:', result.data);
} catch (error) {
  console.error('Product not found:', error.message);
}
```

## Employees

### Get All Employees

```typescript
import { employeeApi } from '@/services';

try {
  const result = await employeeApi.getEmployees({
    page: 1,
    limit: 20,
    status: 'active',
  });
  console.log('Employees:', result.data);
} catch (error) {
  console.error('Failed to get employees:', error.message);
}
```

### Create Employee

```typescript
try {
  const result = await employeeApi.createEmployee({
    name: 'Jane Doe',
    phone: '081234567891',
    email: 'jane@example.com',
    role: 'kasir',
    salary: 3000000,
    joinDate: '2024-01-01',
  });
  console.log('Employee created:', result.data);
} catch (error) {
  console.error('Failed to create employee:', error.message);
}
```

### Update Employee

```typescript
try {
  const result = await employeeApi.updateEmployee(1, {
    salary: 3500000,
    role: 'supervisor',
  });
  console.log('Employee updated:', result.data);
} catch (error) {
  console.error('Failed to update employee:', error.message);
}
```

### Update Employee Status

```typescript
try {
  await employeeApi.updateStatus(1, 'inactive');
  console.log('Employee status updated');
} catch (error) {
  console.error('Failed to update status:', error.message);
}
```

## Transactions

### Get All Transactions

```typescript
import { transactionApi } from '@/services';

try {
  const result = await transactionApi.getTransactions({
    page: 1,
    limit: 20,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    paymentMethod: 'cash',
  });
  console.log('Transactions:', result.data);
} catch (error) {
  console.error('Failed to get transactions:', error.message);
}
```

### Create Transaction

```typescript
try {
  const result = await transactionApi.createTransaction({
    items: [
      {
        productId: 1,
        quantity: 2,
        price: 15000,
      },
      {
        productId: 2,
        quantity: 1,
        price: 25000,
      },
    ],
    paymentMethod: 'cash',
    employeeId: 1,
    notes: 'Pelanggan langganan',
  });
  console.log('Transaction created:', result.data);
} catch (error) {
  console.error('Failed to create transaction:', error.message);
}
```

### Get Transaction Stats

```typescript
try {
  const result = await transactionApi.getStats({
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  });
  console.log('Stats:', result.data);
  // {
  //   totalRevenue: 5000000,
  //   totalTransactions: 150,
  //   averageTransaction: 33333
  // }
} catch (error) {
  console.error('Failed to get stats:', error.message);
}
```

### Get Daily Sales

```typescript
try {
  const result = await transactionApi.getDailySales('2024-01-15');
  console.log('Daily sales:', result.data);
} catch (error) {
  console.error('Failed to get daily sales:', error.message);
}
```

## Error Handling

Semua API call akan throw error jika gagal. Error memiliki format:

```typescript
interface ApiError {
  code: number;        // HTTP status code
  message: string;     // Error message
  errors?: Record<string, string[]>;  // Validation errors (optional)
}
```

### Contoh Error Handling

```typescript
try {
  const result = await productApi.createProduct(data);
  console.log('Success:', result.data);
} catch (error: any) {
  // Error dari API
  if (error.code) {
    console.error('API Error:', error.message);
    
    // Validation errors
    if (error.errors) {
      Object.entries(error.errors).forEach(([field, messages]) => {
        console.error(`${field}:`, messages.join(', '));
      });
    }
    
    // Handle specific error codes
    switch (error.code) {
      case 401:
        console.log('Unauthorized - redirect to login');
        break;
      case 404:
        console.log('Not found');
        break;
      case 500:
        console.log('Server error');
        break;
    }
  } else {
    // Network error atau error lainnya
    console.error('Network error:', error);
  }
}
```

### Automatic 401 Handling

Jika API mengembalikan status 401 (Unauthorized), token akan otomatis dihapus dari AsyncStorage. Anda bisa menambahkan navigation ke login screen di `services/api.ts`:

```typescript
// Di services/api.ts, line ~60
if (error.response?.status === 401) {
  await this.clearToken();
  // TODO: Navigate to login screen
  // NavigationService.navigate('Login');
}
```

## Tips

1. **Loading State**: Gunakan try-catch dan loading state untuk UX yang lebih baik
2. **Error Messages**: Tampilkan error.message ke user dengan Alert atau Toast
3. **Retry Logic**: Untuk network errors, pertimbangkan retry logic
4. **Offline Mode**: Pertimbangkan caching data dengan AsyncStorage untuk offline mode
5. **Token Refresh**: Jika backend support refresh token, implementasikan di interceptor

## Contoh Implementasi di Component

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { productApi, Product } from '@/services';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await productApi.getProducts();
      setProducts(result.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View>
          <Text>{item.name}</Text>
          <Text>Rp {item.price.toLocaleString()}</Text>
        </View>
      )}
    />
  );
}
```
