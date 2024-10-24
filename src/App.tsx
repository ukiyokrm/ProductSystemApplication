// App.tsx
import React, { useState, useEffect } from 'react';
import './App.css';

interface Product {
    _id?: string;
    product_code: string;
    name: string;
    description: string;
    price: string;
    qty: string;
    date_added: string;
    isDeleted?: boolean; // Add this optional field
}

const App = () => {
    const [product, setProduct] = useState<Product>({
        product_code: '',
        name: '',
        description: '',
        price: '',
        qty: '',
        date_added: '',
    });
    const [products, setProducts] = useState<Product[]>([]);
    const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editProductId, setEditProductId] = useState<string | null>(null);

    // Fetch products from the backend
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchDeletedProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/products/deleted');
            const data = await response.json();
            setDeletedProducts(data);
        } catch (error) {
            console.error('Error fetching deleted products:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProduct((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        try {
            console.log('Product data being sent:', product); // Log product data
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing
                ? `http://localhost:5000/products/${editProductId}`
                : 'http://localhost:5000/products';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(product),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                throw new Error('Network response was not ok');
            }

            alert(isEditing ? 'Product updated successfully!' : 'Product saved successfully!');
            fetchProducts();
            handleClear();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product. See console for more details.');
        }
    };

    const handleEdit = (product: Product) => {
        setProduct(product);
        setIsEditing(true);
        setEditProductId(product._id || null);
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`http://localhost:5000/products/${id}`, { method: 'DELETE' });
            alert('Product deleted successfully!');
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product.');
        }
    };

    const handleClear = () => {
        setProduct({
            product_code: '',
            name: '',
            description: '',
            price: '',
            qty: '',
            date_added: '',
        });
        setIsEditing(false);
        setEditProductId(null);
    };

    const handleShowDeleted = async () => {
        await fetchDeletedProducts(); // Fetch and display deleted products
    };

    const handleRestoreProduct = async (id: string) => {
        try {
            await fetch(`http://localhost:5000/products/restore/${id}`, { method: 'PUT' });
            alert('Product restored successfully!');
            fetchProducts();
            handleShowDeleted(); // Refresh deleted products list
        } catch (error) {
            console.error('Error restoring product:', error);
            alert('Failed to restore product.');
        }
    };

    const handlePermanentlyDelete = async (id: string) => {
        try {
            await fetch(`http://localhost:5000/products/permanently/${id}`, { method: 'DELETE' });
            alert('Product permanently deleted successfully!');
            fetchDeletedProducts(); // Refresh deleted products list
        } catch (error) {
            console.error('Error permanently deleting product:', error);
            alert('Failed to permanently delete product.');
        }
    };

    return (
        <div>
            <h1>{isEditing ? 'Edit Product' : 'Add Product'}</h1>
            <form>
                <div>
                    <label>Product Code:</label>
                    <input
                        type="text"
                        name="product_code"
                        value={product.product_code}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <input
                        type="text"
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Price:</label>
                    <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        required
                        step="0.01"
                    />
                </div>
                <div>
                    <label>Quantity:</label>
                    <input
                        type="number"
                        name="qty"
                        value={product.qty}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Date Added:</label>
                    <input
                        type="date"
                        name="date_added"
                        value={product.date_added}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="button" onClick={handleSave}>
                    {isEditing ? 'Update' : 'Save'}
                </button>
                <button type="button" onClick={handleClear}>Clear</button>
            </form>

            <h2>Active Products</h2>
            <ul>
                {products.map((p) => (
                    <li key={p._id}>
                        <div>
                            <strong>{p.product_code}</strong> - {p.name} - ${p.price}
                            <button className="edit-button" onClick={() => handleEdit(p)}>Edit</button>
                            <button className="delete-button" onClick={() => handleDelete(p._id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>

            <button className="show-deleted-button" onClick={handleShowDeleted}>Show Deleted Products</button>
            <ul>
                {deletedProducts.map((p) => (
                    <li key={p._id}>
                        <div>
                            <strong>{p.product_code}</strong> - {p.name} - ${p.price}
                            <button className="edit-button" onClick={() => handleRestoreProduct(p._id)}>Restore</button>
                            <button className="delete-button" onClick={() => handlePermanentlyDelete(p._id)}>Permanently Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );  
};

export default App;
