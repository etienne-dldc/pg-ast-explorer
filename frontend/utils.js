export function convertNode(node) {
  if (Array.isArray(node)) {
    return convertArray(node);
  }
  if (!node) {
    return node;
  }
  if ('str' in node) {
    return node;
  }
  if ('ival' in node) {
    return node;
  }
  const keys = Object.keys(node);
  if (keys.length === 1) {
    const type = keys[0];
    const tmpNode = {
      type,
      ...node[type],
    };
    const data = getNodeData(tmpNode);
    const resultKeys = Object.keys(data);
    Object.keys(node[type]).forEach((key) => {
      if (resultKeys.indexOf(key) === -1) {
        console.info(`=> Unhandled key ${key} in ${type}`);
        console.log({
          [key]: node[type][key],
        });
      }
    });
    return {
      type,
      data,
    };
  }
  return node;
}

function convertArray(nodes) {
  if (!nodes) {
    return nodes;
  }
  return nodes.map((n) => convertNode(n));
}

function getNodeData(node) {
  if (node.type === 'SelectStmt') {
    return {
      op: node.op,
      targetList: convertNode(node.targetList),
      limitCount: convertNode(node.limitCount),
      fromClause: convertNode(node.fromClause),
      whereClause: convertNode(node.whereClause),
      valuesLists: convertNode(node.valuesLists),
    };
  }
  if (node.type === 'ResTarget') {
    return {
      val: convertNode(node.val),
      location: null,
      name: node.name,
      indirection: convertNode(node.indirection),
    };
  }
  if (node.type === 'A_Const') {
    return {
      val: convertNode(node.val),
      location: null,
    };
  }
  if (node.type === 'Integer') {
    return {
      ival: node.ival,
    };
  }
  if (node.type === 'Float') {
    return {
      str: node.str,
    };
  }
  if (node.type === 'ColumnRef') {
    return {
      fields: convertNode(node.fields),
      location: null,
    };
  }
  if (node.type === 'A_Star') {
    return {};
  }
  if (node.type === 'JoinExpr') {
    return {
      jointype: node.jointype,
      larg: convertNode(node.larg),
      quals: convertNode(node.quals),
      rarg: convertNode(node.rarg),
    };
  }
  if (node.type === 'RangeVar') {
    return {
      inhOpt: node.inhOpt,
      location: null,
      relname: node.relname,
      relpersistence: node.relpersistence,
    };
  }
  if (node.type === 'A_Expr') {
    return {
      kind: node.kind,
      lexpr: convertNode(node.lexpr),
      name: convertNode(node.name),
      rexpr: convertNode(node.rexpr),
      location: null,
    };
  }
  if (node.type === 'String') {
    return {
      str: node.str,
    };
  }
  if (node.type === 'ParamRef') {
    return {
      number: node.number,
      location: null,
    };
  }
  if (node.type === 'BoolExpr') {
    return {
      boolop: node.boolop,
      location: null,
      args: convertNode(node.args),
    };
  }
  if (node.type === 'TypeCast') {
    return {
      location: null,
      typeName: convertNode(node.typeName),
      arg: convertNode(node.arg),
    };
  }
  if (node.type === 'TypeName') {
    return {
      names: convertNode(node.names),
      typemod: node.typemod,
      location: null,
      typmods: convertNode(node.typmods),
    };
  }
  if (node.type === 'CreateStmt') {
    return {
      oncommit: node.oncommit,
      relation: convertNode(node.relation),
      tableElts: convertNode(node.tableElts),
    };
  }
  if (node.type === 'ColumnDef') {
    return {
      colname: node.colname,
      is_local: node.is_local,
      location: null,
      typeName: convertNode(node.typeName),
      constraints: convertNode(node.constraints),
    };
  }
  if (node.type === 'Constraint') {
    return {
      contype: node.contype,
      location: null,
      fk_del_action: node.fk_del_action,
      fk_matchtype: node.fk_matchtype,
      fk_upd_action: node.fk_upd_action,
      initially_valid: node.initially_valid,
      pk_attrs: convertNode(node.pk_attrs),
      pktable: convertNode(node.pktable),
      keys: convertNode(node.keys),
    };
  }
  if (node.type === 'AlterTableStmt') {
    return {
      relation: convertNode(node.relation),
      relkind: node.relkind,
      cmds: convertNode(node.cmds),
    };
  }
  if (node.type === 'AlterTableCmd') {
    return {
      behavior: node.behavior,
      subtype: node.subtype,
      def: convertNode(node.def),
    };
  }
  if (node.type === 'InsertStmt') {
    return {
      selectStmt: convertNode(node.selectStmt),
      relation: convertNode(node.relation),
      cols: convertNode(node.cols),
    };
  }
  if (node.type === 'UpdateStmt') {
    return {
      relation: convertNode(node.relation),
      targetList: convertArray(node.targetList),
      whereClause: convertNode(node.whereClause),
    };
  }
  console.log(node);
  console.info(`=> Unhandled type ${node.type}`);
}
