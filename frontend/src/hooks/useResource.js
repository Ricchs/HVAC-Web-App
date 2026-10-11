import { useEffect, useState, useContext } from "react";
import { ToastContext } from "../notifications/ToastProvider";
import { apiFetch } from "../utils/api";

function useResource({
  endpoint,
  noun,
  pluralNoun,
  getName,
  onChange = () => {},
}) {
  const { addToast } = useContext(ToastContext);

  const [items, setItems] = useState([]);

  const [search, setSearch] = useState("");

  //  Load items function
  async function loadItems(signal) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);

    try {
      const data = await apiFetch(`${endpoint}?${params}`, { signal });
      setItems(data);
    } catch (error) {
      if (error.name === "AbortError") return;

      addToast({
        message: `Couldn't load ${pluralNoun}`,
        submessage: error.message,
        status: "error",
      });
    }
  }

  //  Load function
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadItems(controller.signal);
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  //  Remove item function
  async function deleteItem(item) {
    if (!confirm(`Delete ${getName(item)}?`)) return;

    const capitalNoun = noun.charAt(0).toUpperCase() + noun.slice(1);

    try {
      await apiFetch(`${endpoint}/${item.id}`, { method: "DELETE" });
      await loadItems();
      await onChange();

      addToast({
        message: `${capitalNoun} deleted`,
        submessage: `${getName(item)} was removed from your ${pluralNoun}.`,
        status: "success",
      });
    } catch (error) {
      addToast({
        message: `Couldn't delete ${noun}`,
        submessage: error.message,
        status: "error",
      });
    }
  }

  return { items, search, setSearch, loadItems, deleteItem };
}

export default useResource;
