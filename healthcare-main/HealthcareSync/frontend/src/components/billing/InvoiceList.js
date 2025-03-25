import React from "react";

const InvoiceList = ({ invoices }) => {
  return (
    <table role="table">
      <thead>
        <tr role="row">
          <th scope="col">Invoice #</th>
          <th scope="col">Patient</th>
          <th scope="col">Amount</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <tr key={invoice.id} role="row">
              <td>{invoice.number}</td>
              <td>{invoice.patient}</td>
              <td>${invoice.amount}</td>
              <td>{invoice.status}</td>
            </tr>
          ))
        ) : (
          <tr role="row">
            <td colSpan="4">No invoices found</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default InvoiceList;
