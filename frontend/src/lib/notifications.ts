
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const NAVY = "#123B6D";

type ToastType = "success" | "error" | "info" | "warning";

export function showToast(
  message: string,
  type: ToastType = "success"
) {
  toast(message, {
    type,
    position: "top-right",
    autoClose: 3500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
  });
}

export async function confirmDelete(
  itemName = "this product"
): Promise<boolean> {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: `You are about to delete ${itemName}. This action cannot be undone.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: true,
    buttonsStyling: false,
    customClass: {
      popup: "swal-admin-popup",
      title: "swal-admin-title",
      htmlContainer: "swal-admin-message",
      actions: "swal-admin-actions",
      confirmButton: "swal-admin-confirm",
      cancelButton: "swal-admin-cancel",
    },
  });

  return result.isConfirmed;
}

export function showDeleteSuccess(itemName = "Product") {
  return Swal.fire({
    title: "Deleted!",
    text: `${itemName} has been deleted successfully.`,
    icon: "success",
    confirmButtonText: "Done",
    buttonsStyling: false,
    customClass: {
      popup: "swal-admin-popup",
      title: "swal-admin-title",
      htmlContainer: "swal-admin-message",
      confirmButton: "swal-admin-confirm",
    },
  });
}
