import Dropdown from "react-bootstrap/Dropdown";
import "./purchase-type.scss";

function PurchaseType({ value, onChange }) {
  const purchaseTypes = [
    { label: "Distribution", value: "distribution" },
    { label: "Wholesale", value: "wholesale" },
    { label: "Retail", value: "retail" },
  ];

  const selectedLabel = purchaseTypes.find(type => type.value === value)?.label || "Purchase Type";

  return (
    <>
      <div className="select-div">
        <Dropdown>
          <Dropdown.Toggle id="dropdown-button-dark-example1">
            {selectedLabel}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {purchaseTypes.map((type) => (
              <Dropdown.Item
                key={type.value}
                active={value === type.value}
                onClick={() => onChange && onChange(type.value)}
              >
                {type.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </>
  );
}

export default PurchaseType;
