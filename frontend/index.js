// polyfill
import "core-js/stable";
import "regenerator-runtime/runtime";

import React from "react";
import ReactDOM from "react-dom";
import { convertNode } from "./utils";

const req = window.require;
const { ipcRenderer: ipc } = req("electron-better-ipc");

const App = () => {
  const [query, setQuery] = React.useState(
    // "SELECT * FROM courses_users LEFT JOIN courses ON courses_users.course_id = courses.id WHERE courses_users.user_id = $1 AND (1 + 1) * 3 = 7 AND true OR false;"
    // "CREATE TABLE Persons (PersonID int PRIMARY KEY, LastName varchar(255) NOT NULL , FirstName varchar(255) UNIQUE NOT NULL, Address varchar(255) REFERENCES other(id), City varchar(255), PRIMARY KEY (foo, bar));"
    // "ALTER TABLE Orders ADD FOREIGN KEY (PersonID) REFERENCES Persons(PersonID);"
    // "INSERT INTO some_table (some_table.column1, some_table.column2, column3) VALUES ($2, 45 + 345, true), (2, 3, false);"
    "UPDATE table_name SET column1 = value1, column2 = value2 WHERE condition;"
  );
  const [parsed, setParsed] = React.useState(null);

  React.useEffect(() => {
    ipc.callMain("parse", query).then(parsed => {
      setParsed(parsed);
    });
  }, [query]);

  return (
    <div>
      <textarea
        style={{ display: "block", width: "100%" }}
        value={query}
        onChange={e => setQuery(e.target.value)}
      ></textarea>
      <button
        onClick={async () => {
          const parsed = await ipc.callMain("parse", query);
          setParsed(parsed);
        }}
      >
        Parse
      </button>
      <ASTExplorer parsed={parsed} />
    </div>
  );
};

const ASTExplorer = ({ parsed }) => {
  if (parsed === null) {
    return null;
  }
  if (parsed.error) {
    return <pre>{JSON.stringify(parsed)}</pre>;
  }
  return (
    <div>
      {parsed.query.map((query, index) => (
        <Query key={index} query={query} />
      ))}
    </div>
  );
};

const Query = ({ query }) => {
  return <NodeDisplay property="root" node={convertNode(query)} />;
  // return <pre>{JSON.stringify(convertNode(query), null, 2)}</pre>;
};

const NodeDisplay = ({ property, node }) => {
  const [raw, setRaw] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  if (!node) {
    return null;
  }

  if (Array.isArray(node)) {
    return <NodeList property={property} nodes={node} />;
  }

  return (
    <div>
      <p>
        <span onClick={() => setCollapsed(p => !p)}>
          {collapsed ? "▶︎" : "▼"} {property}:{" "}
          <span className="node-type">{node.type}</span>{" "}
        </span>
        {collapsed === false && (
          <span className="btn" onClick={() => setRaw(p => !p)}>
            {raw ? "pretty" : "raw"}
          </span>
        )}
      </p>
      {collapsed === false && (
        <div className="indent">
          {raw ? (
            <pre>{JSON.stringify(convertNode(node.data), null, 2)}</pre>
          ) : (
            <NodeContent node={node} />
          )}
        </div>
      )}
    </div>
  );
};

const ValueDisplay = ({ property, value }) => {
  const formated = (() => {
    if (typeof value === "string") {
      return (
        <>
          <span style={{ color: "#FF9800" }}>"{value}"</span>
          <span className="value-type">(string)</span>
        </>
      );
    }
    if (typeof value === "number") {
      return (
        <>
          <span style={{ color: "#E91E63" }}>{value}</span>
          <span className="value-type">(number)</span>
        </>
      );
    }
    return value;
  })();

  return (
    <p>
      &nbsp;&nbsp;
      {property}: {formated}
    </p>
  );
};

const NodeList = ({ nodes, property }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div>
      <p onClick={() => setCollapsed(p => !p)}>
        {collapsed ? "▶︎" : "▼"} {property}:{" "}
        <span className="node-type">Array({nodes.length})</span>
      </p>
      {collapsed === false && (
        <div className="indent">
          {nodes.map((node, index) => {
            return <NodeDisplay property={index} key={index} node={node} />;
          })}
        </div>
      )}
    </div>
  );
};

const NodeContent = ({ node }) => {
  return Object.keys(node.data).map(key => {
    const val = node.data[key];
    if (val === null || val === undefined) {
      return null;
    }
    if (val && val.type) {
      return <NodeDisplay key={key} property={key} node={val} />;
    }
    if (Array.isArray(val)) {
      return <NodeList key={key} property={key} nodes={val} />;
    }
    return <ValueDisplay key={key} property={key} value={val} />;
  });
};

ReactDOM.render(<App />, document.getElementById("app"));
