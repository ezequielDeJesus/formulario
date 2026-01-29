import React from 'react';
import { Trash2, X, Plus } from 'lucide-react';
import { FormConfig, Product } from '../../types';
import Button from '../Button';

interface ProductsTabProps {
    form: FormConfig;
    setForm: React.Dispatch<React.SetStateAction<FormConfig>>;
    updateProduct: (pId: string, updates: Partial<Product>) => void;
    addProduct: () => void;
    addProductImage: (pId: string, base64: string) => void;
    removeProductImage: (pId: string, imgIndex: number) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => void;
}

const ProductsTab: React.FC<ProductsTabProps> = ({
    form,
    setForm,
    updateProduct,
    addProduct,
    addProductImage,
    removeProductImage,
    handleFileUpload
}) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                {form.products.map((p) => (
                    <div key={p.id} className="bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800 shadow-sm space-y-4 relative">
                        <button
                            onClick={() => setForm({ ...form, products: form.products.filter(pr => pr.id !== p.id) })}
                            className="absolute top-4 right-4 text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={p.name}
                                    onChange={(e) => updateProduct(p.id, { name: e.target.value })}
                                    className="w-full p-2 text-sm border dark:border-gray-700 rounded-lg font-bold bg-transparent dark:text-white outline-none focus:border-blue-500"
                                    placeholder="Nome do Produto"
                                />
                                <textarea
                                    value={p.description}
                                    onChange={(e) => updateProduct(p.id, { description: e.target.value })}
                                    className="w-full p-2 text-sm border dark:border-gray-700 rounded-lg h-24 resize-none bg-transparent dark:text-gray-300 outline-none focus:border-blue-500"
                                    placeholder="Descrição..."
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    {p.imageUrls?.map((url, idx) => (
                                        <div key={idx} className="aspect-square border dark:border-gray-700 rounded-lg overflow-hidden relative group">
                                            <img src={url} className="w-full h-full object-cover" alt={`Product ${idx}`} />
                                            <button
                                                onClick={() => removeProductImage(p.id, idx)}
                                                className="absolute top-1 right-1 p-1 bg-white/80 dark:bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} className="text-red-500" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square border-2 border-dashed dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 hover:text-blue-500 hover:border-blue-500 cursor-pointer transition-all">
                                        <Plus size={20} />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, (base64) => addProductImage(p.id, base64))}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={p.price}
                                onChange={(e) => updateProduct(p.id, { price: e.target.value })}
                                className="flex-1 p-2 text-sm border dark:border-gray-700 rounded-lg bg-transparent dark:text-white outline-none focus:border-blue-500"
                                placeholder="R$ 0,00"
                            />
                            <input
                                type="text"
                                value={p.ctaLink}
                                onChange={(e) => updateProduct(p.id, { ctaLink: e.target.value })}
                                className="flex-[2] p-2 text-sm border dark:border-gray-700 rounded-lg bg-transparent dark:text-white outline-none focus:border-blue-500"
                                placeholder="Link de Compra"
                            />
                        </div>
                    </div>
                ))}
            </div>
            <Button
                onClick={addProduct}
                variant="outline"
                className="w-full py-4 text-gray-400 dark:text-gray-500 border-dashed"
                icon={<Plus size={20} />}
            >
                Adicionar Produto
            </Button>
        </div>
    );
};

export default ProductsTab;
