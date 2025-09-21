import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  // Fetch contacts
  useEffect(() => {
    axios
      .get(`http://localhost:5000/contacts?page=${page}&limit=${limit}`)
      .then((res) => {
        setContacts(res.data.contacts);
        setTotal(res.data.total);
      })
      .catch((err) => console.error(err));
  }, [page]);

  // Validation
  const validate = () => {
    let errs = {};
    if (!form.name) errs.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email";
    if (!/^\d{10}$/.test(form.phone)) errs.phone = "Phone must be 10 digits";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    axios
      .post("http://localhost:5000/contacts", form)
      .then((res) => {
        setContacts([res.data, ...contacts]);
        setForm({ name: "", email: "", phone: "" });
      })
      .catch((err) => alert(err.response.data.error));
  };

  // Delete contact
  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:5000/contacts/${id}`)
      .then(() => setContacts(contacts.filter((c) => c.id !== id)))
      .catch((err) => console.error(err));
  };

  // Pagination controls
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="App">
      <h1>📒 Contact Book</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && <span className="error">{errors.name}</span>}

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {errors.email && <span className="error">{errors.email}</span>}

        <input
          type="text"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        {errors.phone && <span className="error">{errors.phone}</span>}

        <button type="submit">Add Contact</button>
      </form>

      {/* Contacts List */}
      <ul className="contact-list">
        {contacts.map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong> | {c.email} | {c.phone}
            <button onClick={() => handleDelete(c.id)}>❌</button>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
