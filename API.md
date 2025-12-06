NOTE:
BASE_URL = Menggunakan prefix /api/v1 -> untuk versioning
Struktur response  :
{
    success: boolean,
    message: string,
    data: any
}
Pastikan response code sesuai ( 201 untuk pembuatan record, 200 untuk success, 400 untuk client error, 422 untuk kesalahan validasi , 500 untuk server error), 401 unauthrized
Untuk Endpoint yang diprotect gunakan header authorization barrier
Sesuaikan method sesuai action
Untuk branching menggunakan header branch_id


API LIST :
AUTH : 
LOGIN : 
Endpoint : /auth/login (POST)
Payload : {email: string, phone: string, pin: string, device_id: string}
REGISTER: 
Endpoint : /auth/register (POST)
Payload : {country: string, bussiness_name: string, business_type: string, bussiness_regency: {id: string, name: string}, bussiness_address: string, owner_name: string, owner_phone: string, pin: string, owner_email: string, is_accept_tos: bool}
REQUEST OTP: 
Endpoint : /auth/otp/request (POST)
Payload : {phone: string}
Validate OTP: 
Endpoint : /auth/otp/validate (POST)
Payload : {phone: string, otp: string}
Logout: 
Endpoint : /auth/logout (POST)





STATS : 
Sales : 
Endpoint : /stats/sales (GET)
Payload : 
Response data : { current_month: { amount: int, percentage_than_prev_month: int }, today: { amount: int, percentage_than_prev_day: int } }

Asset : 
Upload file: 
Endpoint : /asset/upload (POST)
Payload: {file: binary_file}
NOTE: 
pake form data 
type file untuk validasi size max, untuk validasi be dan fe type image max 2mb 
Response data : {asset_url: string, size: string (example x KB, x MB}, filename: string)

PRODUCT MANAGEMENT : 
Product list : 
Endpoint : /products (GET)
Query : category_id, search (untuk repeatable  gunakan repeatcategory_id=a& category_id=b ), is_favorite (true, false), branch_id 
Payload :  
Response data : { id: string, name: string,  photo_url: string,  variant_count: int , price_count: int, stock} 
Product detail : 
Endpoint : /products/:id (GET)
Payload :  
Response data : {id: string, photo_url: string?, name: string, price:int, merk_id: string?, category_id: string?, is_favorite: bool, is_stock_active: bool, stock: int?, min_stock: int?,  notify_on_stock_ronouts: bool ?,  unit_id: string?,  capital_price: int, barcode, variants: Array<{id: string, name: string, price, capital_price: int?, barcode: string?, stock: int?, min_stock:int?, notify_on_stock_ronouts: bool ?}>} 
Create product : 
Endpoint : /products (POST)
Payload :  {photo_url: string?, name: string, price:int, merk_id: string?, category_id: string?, is_favorite: bool, is_stock_active: bool, stock: int?, min_stock: int?,  notify_on_stock_ronouts: bool,  unit_id: string?,  capital_price: int, barcode: string, variants: Array<{name: string, price, capital_price: int?, barcode: string?, stock: int?, min_stock:int?, notify_on_stock_ronouts: bool ?}> }
Add product from main store : 
Endpoint : /products/add-from-branch/:product_id (POST)
Payload :  {photo_url: string?, custom_name: string, price:int, is_favorite: bool, is_stock_active: bool, stock: int?, min_stock: int?,  notify_on_stock_ronouts: bool,  unit_id: string?,  capital_price: int, variants: Array<{name: string, price, capital_price: int?, barcode: string?, stock: int?, min_stock:int?, notify_on_stock_ronouts: bool ?}> }
Update product : 
Endpoint : /products/:id (PUT)
Payload :  {photo_url: string?, name: string, price:int, merk_id: string?, category_id: string?, is_favorite: bool, is_stock_active: bool, stock: int?, min_stock: int?,  notify_on_stock_ronouts: bool ?,  unit_id: string?,  capital_price: int, barcode, variants: Array<{name: string, price, capital_price: int?, barcode: string?, stock: int?, min_stock:int?, notify_on_stock_ronouts: bool ?}> }
Update product stock: 
Endpoint : /products/:id/stock (PUT)
Response data : { action_type: “adjust_stock”| “add_stock”| “reduce_stock”,amount: int}
Delete product
Endpoint : /products/:id (DEL)


CATEGORY MANAGEMENT : 
Category list : 
Endpoint : /product-categories (GET)
Response data : { id: string, name: string}
Create category : 
Endpoint : /product-categories (POST)
Response data : { name: string}
Update category : 
Endpoint : /product-categories/:id (PUT)
Response data : { name: string}
Delete category :
 Endpoint : /product-categories/:id (DEL)
MERK MANAGEMENT : 
Merk list : 
Endpoint : /product-merks (GET)
Response data : { id: string, name: string}
Create Merk: 
Endpoint : /product-merks (GET)
Response data : { name: string}
Update merk: 
Endpoint : /product-merks/:id  (PUT)
Response data : { name: string}
Delete merk:
 Endpoint : /product-merks/:id (DEL)

TRANSACTION : 
Transaction lists : 
Endpoint : /transactions (GET)
Response data : { id: string, name: string}
Create transaction: 
Endpoint : /transactions (POST)
Payload: { products : Array<{porduct_id: string, quantity: string, variant_id: string?}> , additional_fees: Array<{name: string, amount: int}>, paid_ammout: int, change_amount: int, payment_method: “cash” }
Detail transaction: 
Endpoint : /transactions/:id (GET)
Response data: {id: string, payment_method: string, cashier : {id: string, name: string}, status: string, products: Array<{name: string, quantity, price, variant: {id: string, name: string, price: int}}?>, additional_fees: Array<{name: string, amount: int}>, subtotal: int, total: int, paid_amount: int, change_amount: int, note: string, struck_url: string , created_at}
Cancel transacton: 
Endpoint : /transactions/:id (POST)

Setting : 
Get profile : 
Endpoint : /profile (GET)
Response data : {name: string, email : string , country:string, profile_url: string?}
Update profile : 
Endpoint : /profile (PUT)
Response data : {name: string, email : string , country:string, profile_url: string?}
Delete account : 
Endpoint : /account/delete (DELETE)
Update pin : 
Endpoint : /account/pin (PUT)
Payload: {old_pin: string, new_pin: string, new_pin_confirmation: string}
Get store detail : 
Endpoint : /setting/store (GET)
Payload: { bussiness_type: string, branch: {id: string, name: string} , bussiness_name: string, tax: int, owner_name: string, owner_phone , currency: “idr”, language: “id”|“en”, province: {name: string, id: string}, country : {name: string, id: string} , subdistrict: {name: string, id: string}, city: {name: string, id: string}, village: {name: string, id: string}, address: string}
Update store : 
Endpoint : /setting/store (PUT)
payload: { bussiness_type: string, bussiness_name: string, tax: int, owner_name: string, owner_phone , currency: “idr”, language: “id”|“en”, province: {name: string, id: string}, country : {name: string, id: string} , subdistrict: {name: string, id: string}, city: {name: string, id: string}, village: {name: string, id: string}, address: string}
Detail transaction: 
Endpoint : /transactions/:id (GET)
Response data: {id: string, payment_method: string, cashier : {id: string, name: string}, status: string, products: Array<{name: string, quantity, price, variant: {id: string, name: string, price: int}}?>, additional_fees: Array<{name: string, amount: int}>, subtotal: int, total: int, paid_amount: int, change_amount: int, note: string, struck_url: string , created_at}


Get POS Devices : 
Endpoint : /pos-devices (GET)
Response data: {id: string, name: string, device_address: string, is_default: bool, status: string}
Add POS Devices : 
Endpoint : /pos-devices (POST)
Response data: {id: string, name: string, device_address: string, status: ”connected”}
Update default printer
Endpoint : /pos-devices/set-default (PUT)
Response data : {device_id: string, type: “printer”|”scanner”}
Get struck config: 
Endpoint : /setting/struck (GET)
Response data: {logo_url : string?, footer_description: string, display_transaction_note: bool, hide_tax_percentage: bool}
Update struck config: 
Endpoint : /setting/struck (PUT)
Response data: {logo_url : string?, footer_description: string, display_transaction_note: bool, hide_tax_percentage: bool}

