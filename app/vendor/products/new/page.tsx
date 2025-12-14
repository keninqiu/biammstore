'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AddProductPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [stock, setStock] = useState('1')
    const [description, setDescription] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])

    // Fetch categories on mount
    useEffect(() => {
        fetch('/api/categories') // Need to ensure this exists or mock it
            .then(res => res.json())
            .then(data => {
                if (data.categories) setCategories(data.categories)
            })
            .catch(console.error)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/vendor/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    priceUSD: parseFloat(price),
                    stock: parseInt(stock),
                    categoryId: categoryId || categories[0]?.id // Fallback or required
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to create product')
            }

            router.push('/vendor/products')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Product Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Price (USD)</label>
                            <input
                                type="number"
                                required
                                min="0.01"
                                step="0.01"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Stock</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={stock}
                                onChange={e => setStock(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <select
                            required
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
                        >
                            <option value="">Select a category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {categories.length === 0 && (
                            <p className="text-xs text-yellow-500 mt-1">No categories found. Admin needs to create categories.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            required
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-700 h-32"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 font-medium text-center">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Product'}
                    </button>
                </form>
            </div>
        </div>
    )
}
