#!/bin/bash
echo "1. Root"
curl -s -w "\\nHTTP %{http_code}\\n\\n" http://localhost:3000/
echo "2. Products"
curl -s -w "\\nHTTP %{http_code}\\n\\n" http://localhost:3000/api/products
echo "3. Clients"
curl -s -w "\\nHTTP %{http_code}\\n\\n" http://localhost:3000/api/clients
echo "4. Providers"
curl -s -w "\\nHTTP %{http_code}\\n\\n" http://localhost:3000/api/providers
echo "5. Dashboard Stats"
curl -s -w "\\nHTTP %{http_code}\\n\\n" http://localhost:3000/api/dashboard/stats
echo "6. Finance"
curl -s -w "\\nHTTP %{http_code}\\n\\n" http://localhost:3000/api/finance
echo "7. Invoices"
curl -s -w "\\nHTTP %{http_code}\\n\\n" http://localhost:3000/api/invoices
echo "8. Register"
curl -s -w "\\nHTTP %{http_code}\\n\\n" -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"username":"test4","password":"123","email":"4"}'
echo "9. Login"
curl -s -w "\\nHTTP %{http_code}\\n\\n" -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username":"test4","password":"123"}'
echo "10. Tenant Santi Products"
curl -s -w "\\nHTTP %{http_code}\\n\\n" -H "x-tenant-id: santi" http://localhost:3000/api/products
