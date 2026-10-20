
"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  showToast,
  confirmDelete,
} from "@/src/lib/notifications";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_URL = `${BASE_URL}/api/products`;
const FALLBACK_IMAGE =
  "https://dummyimage.com/200x200/e2e8f0/64748b&text=No+Image";

const NAVY = "#123B6D";

type Product = {
  _id: string;
  name: string;
  price: number;
  category: string;
  images?: string[];
};


function getImageUrl(path?: string) {
  if (!path) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(path)) return path;

  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function readResponse<T>(response: Response): Promise<T> {
  const responseText = await response.text();

  let data: {
    message?: string;
    error?: string;
    products?: Product[];
  } = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    // Handle non-JSON responses 
  }

  if (!response.ok) {
    console.error("API Error Details:", {
      status: response.status,
      statusText: response.statusText,
      response: responseText,
    });

    throw new Error(
      data.message ||
        data.error ||
        `Request failed: ${response.status} ${response.statusText}`
    );
  }

  return data as T;
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-semibold text-slate-700"
    >
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#123B6D] focus:ring-4 focus:ring-blue-900/10";

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);

  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const loadProducts = useCallback(async () => {
  setLoading(true);

  try {
    const response = await fetch(API_URL);
    const data = await readResponse<unknown>(response);

    const list = Array.isArray(data)
      ? data
      : typeof data === "object" &&
          data !== null &&
          "products" in data &&
          Array.isArray(data.products)
        ? data.products
        : null;

    if (!list) {
      throw new Error("Invalid products response from server");
    }

    setProducts(list as Product[]);
  } catch (error) {
    console.error(error);

    showToast(
      error instanceof Error
        ? `Failed to load products: ${error.message}`
        : "Failed to load products",
      "error"
    );
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    if (!localStorage.getItem("adminLoginTime")) {
      router.replace("/");
      return;
    }

    setAuthenticated(true);
    void loadProducts();
  }, [router, loadProducts]);

  useEffect(() => {
    if (!isEditOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsEditOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditOpen]);

  function handleNewImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image", "error");
      event.target.value = "";
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleEditImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image", "error");
      event.target.value = "";
      return;
    }

    if (editImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview);
    }

    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  }

  async function handleAddProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!imageFile) {
      showToast("Please select a product image", "error");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("image", imageFile);

    setSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      await readResponse(response);

      showToast("Product added successfully");

      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      setName("");
      setPrice("");
      setCategory("");
      setImageFile(null);
      setImagePreview("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadProducts();
    } catch (error) {
      console.error(error);
      showToast(
        error instanceof Error
          ? `Error adding product: ${error.message}`
          : "Error adding product",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function editProduct(id: string) {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const data = await readResponse<Product>(response);

      setEditId(data._id);
      setEditName(data.name);
      setEditPrice(String(data.price));
      setEditCategory(data.category);
      setEditImageFile(null);
      setEditImagePreview(
        data.images?.[0] ? getImageUrl(data.images[0]) : ""
      );

      if (editFileInputRef.current) {
        editFileInputRef.current.value = "";
      }

      setIsEditOpen(true);
    } catch (error) {
      console.error(error);
      showToast(
        error instanceof Error
          ? `Error fetching product: ${error.message}`
          : "Error fetching product",
        "error"
      );
    }
  }

  async function handleEditProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", editName);
    formData.append("price", editPrice);
    formData.append("category", editCategory);

    if (editImageFile) {
      formData.append("image", editImageFile);
    }

    setSavingEdit(true);

    try {
      const response = await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        body: formData,
      });

      await readResponse(response);

      showToast("Product edited successfully");
      setIsEditOpen(false);

      await loadProducts();
    } catch (error) {
      console.error(error);
      showToast(
        error instanceof Error
          ? `Error updating product: ${error.message}`
          : "Error updating product",
        "error"
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteProduct(id: string) {
  const product = products.find((item) => item._id === id);

  const confirmed = await confirmDelete(
    product ? `"${product.name}"` : "this product"
  );

  if (!confirmed) return;

  setDeletingId(id);

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    await readResponse(response);

    setProducts((current) =>
      current.filter((item) => item._id !== id)
    );

    showToast("Product deleted successfully", "success");
  } catch (error) {
    console.error(error);

    showToast(
      error instanceof Error
        ? `Error deleting product: ${error.message}`
        : "Error deleting product",
      "error"
    );
  } finally {
    setDeletingId("");
  }
}

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <span
            className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#123B6D]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-slate-600">
            Checking admin session...
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 sm:pt-28">
    
      <main className="mx-auto w-full max-w-[1500px] px-4 pb-12 sm:px-6 lg:px-8">
        {/* Page heading */}
        <header className="mb-8 flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#123B6D]">
              <span className="h-2 w-2 rounded-full bg-[#123B6D]" />
              Product Management
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Add Product
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Add new products to your store and manage your existing
              inventory from one place.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5 text-[#123B6D]"
              aria-hidden="true"
            >
              <path d="M3 7h18M5 7l1 13h12l1-13M9 7V4h6v3" />
            </svg>
            <div>
              <p className="text-xs text-slate-500">Total products</p>
              <p className="text-lg font-bold leading-5 text-slate-900">
                {products.length}
              </p>
            </div>
          </div>
        </header>

        {/* Add Product Form */}
        <section
          aria-labelledby="add-product-heading"
          className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5 sm:px-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#123B6D]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>

            <div>
              <h2
                id="add-product-heading"
                className="text-lg font-bold text-slate-900"
              >
                Product Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the details below to create a product.
              </p>
            </div>
          </div>

          <form
            id="productForm"
            onSubmit={handleAddProduct}
            className="p-5 sm:p-7"
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <FieldLabel htmlFor="name">Product Name</FieldLabel>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <FieldLabel htmlFor="price">Price</FieldLabel>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-slate-400">
                    Rs.
                  </span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    required
                    className={`${inputClass} pl-12`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <input
                  type="text"
                  id="category"
                  name="category"
                  placeholder="e.g. Formal Wear, Lawn, Bridal"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <FieldLabel htmlFor="imageUpload">Product Image</FieldLabel>

                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 transition hover:border-[#123B6D]/50 sm:p-5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="imageUpload"
                    name="imageUpload"
                    accept="image/*"
                    required
                    onChange={handleNewImage}
                    className="block w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#123B6D] file:px-4 file:py-2.5 file:font-semibold file:text-white file:transition hover:file:bg-[#0D2F57] focus:outline-none"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Select an image file to preview it before adding the
                    product.
                  </p>

                  {imagePreview && (
                    <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="New product preview"
                        className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
                      />

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Image selected
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Preview of your new product image.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (imagePreview.startsWith("blob:")) {
                            URL.revokeObjectURL(imagePreview);
                          }
                          setImageFile(null);
                          setImagePreview("");
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="ml-auto rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Fields marked as required must be completed.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#123B6D] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0D2F57] focus:outline-none focus:ring-4 focus:ring-blue-900/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Adding Product...
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add Product
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Product List */}
        <section
          id="productTableWrapper"
          aria-labelledby="product-list-heading"
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <h2
                id="product-list-heading"
                className="text-lg font-bold text-slate-900"
              >
                Product Inventory
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View, edit, and remove products from your store.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-[#123B6D]">
              <span className="h-2 w-2 rounded-full bg-[#123B6D]" />
              {loading ? "Loading..." : `${products.length} products`}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table
              id="productTable"
              className="w-full min-w-[720px] border-collapse text-left text-sm"
            >
              <thead>
                <tr className="bg-slate-50">
                  {["Product", "Image", "Price", "Category", "Actions"].map(
                    (heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="border-b border-slate-200 px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <span className="mx-auto mb-3 block h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#123B6D]" />
                      <p className="text-sm font-medium text-slate-500">
                        Loading products...
                      </p>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          className="h-6 w-6"
                          aria-hidden="true"
                        >
                          <path d="M3 7h18l-2 13H5L3 7ZM8 7l4-4 4 4" />
                        </svg>
                      </div>
                      <p className="font-semibold text-slate-800">
                        No products found
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Add your first product using the form above.
                      </p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product._id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {product.name}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => void editProduct(product._id)}
                          title="Preview or edit product"
                          className="inline-flex rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123B6D] focus:ring-offset-2"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getImageUrl(product.images?.[0])}
                            alt={product.name}
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = FALLBACK_IMAGE;
                            }}
                            className="h-16 w-16 rounded-lg border border-slate-200 bg-slate-50 object-cover"
                          />
                        </button>
                      </td>

                      <td className="px-5 py-4 font-semibold tabular-nums text-slate-800">
                        Rs. {Number(product.price).toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                          {product.category}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void editProduct(product._id)}
                            title="Edit product"
                            aria-label={`Edit ${product.name}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#123B6D] transition hover:border-[#123B6D] hover:bg-blue-50"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <path d="m15 5 4 4M4 20l4-.8L19 8a2.12 2.12 0 0 0-3-3L5 16z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => void deleteProduct(product._id)}
                            disabled={deletingId === product._id}
                            title="Delete product"
                            aria-label={`Delete ${product.name}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-white text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === product._id ? (
                              <span className="text-xs">...</span>
                            ) : (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-4 w-4"
                                aria-hidden="true"
                              >
                                <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50/70 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {loading
                ? "Retrieving inventory..."
                : `Showing ${products.length} product${products.length === 1 ? "" : "s"}`}
            </span>
            <button
              type="button"
              onClick={() => void loadProducts()}
              disabled={loading}
              className="inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 font-semibold text-[#123B6D] transition hover:bg-blue-50 disabled:opacity-50"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M20 7v5h-5M4 17v-5h5M5.5 9a7 7 0 0 1 11.7-2L20 12M4 12l2.8 5a7 7 0 0 0 11.7-2" />
              </svg>
              Refresh products
            </button>
          </div>
        </section>
      </main>

      {/* Edit Product Modal */}
            {/* Edit Product Modal */}
      {isEditOpen && (
        <div
          className="fixed inset-0 z-[90] overflow-y-auto overscroll-contain bg-slate-950/60 p-3 backdrop-blur-[3px] sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsEditOpen(false);
            }
          }}
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="editModalTitle"
            className="mx-auto my-3 flex w-full max-w-[520px] flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl sm:my-6"
            style={{
              maxHeight: "calc(100dvh - 3rem)",
            }}
          >
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6 sm:py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#123B6D]">
                  Inventory Management
                </p>

                <h2
                  id="editModalTitle"
                  className="mt-1 text-xl font-bold text-slate-900"
                >
                  Edit Product
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                aria-label="Close modal"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                ×
              </button>
            </div>

            {/* Scrollable Edit Form */}
            <form
              onSubmit={handleEditProduct}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
              style={{
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-y",
              }}
            >
              <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
                <input type="hidden" value={editId} readOnly />

                {/* Product Name */}
                <div>
                  <FieldLabel htmlFor="editName">
                    Product Name
                  </FieldLabel>

                  <input
                    id="editName"
                    type="text"
                    value={editName}
                    onChange={(event) =>
                      setEditName(event.target.value)
                    }
                    required
                    className={inputClass}
                  />
                </div>

                {/* Price */}
                <div>
                  <FieldLabel htmlFor="editPrice">
                    Price
                  </FieldLabel>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-slate-400">
                      Rs.
                    </span>

                    <input
                      id="editPrice"
                      type="number"
                      min="0"
                      step="any"
                      value={editPrice}
                      onChange={(event) =>
                        setEditPrice(event.target.value)
                      }
                      required
                      className={`${inputClass} pl-12`}
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <FieldLabel htmlFor="editCategory">
                    Category
                  </FieldLabel>

                  <input
                    id="editCategory"
                    type="text"
                    value={editCategory}
                    onChange={(event) =>
                      setEditCategory(event.target.value)
                    }
                    required
                    className={inputClass}
                  />
                </div>

                {/* Product Image */}
                <div>
                  <FieldLabel htmlFor="editImageUpload">
                    Product Image
                  </FieldLabel>

                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    <input
                      ref={editFileInputRef}
                      id="editImageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleEditImage}
                      className="block w-full cursor-pointer text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#123B6D] file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-[#0D2F57]"
                    />

                    {editImagePreview && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        id="editPreview"
                        src={editImagePreview}
                        alt="Product image preview"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = FALLBACK_IMAGE;
                        }}
                        className="mt-4 h-24 w-24 rounded-lg border border-slate-200 bg-white object-cover"
                      />
                    )}
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Choose a new image only if you want to replace the
                    current one.
                  </p>
                </div>
              </div>

              {/* Fixed-in-modal Footer */}
              <div className="sticky bottom-0 flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="min-h-11 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#123B6D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0D2F57] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingEdit && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}

                  {savingEdit ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
