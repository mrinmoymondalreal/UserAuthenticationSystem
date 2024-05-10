function typesetter(value) {
  if (value.type == "string") {
    if (value.len && value.len.max > 255) return " TEXT";
    return ` VARCHAR(${value.len.max})`;
  } else if (value.type == "number") {
  }
}

export function createTable(model) {
  let keys = Object.keys(model);
  let sql = `CREATE TABLE zuth_users (\n`;
  sql += `\tid TEXT PRIMARY KEY DEFAULT generate_ulid(),\n`;
  if (model.mobile)
    sql += `\tis_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,\n`;
  if (model.email)
    sql += `\tis_email_verified BOOLEAN NOT NULL DEFAULT FALSE,\n`;
  for (let key of keys) {
    sql += `\t${key}${typesetter(model[key])}${
      (model[key].isRequired && " NOT NULL") || ""
    }${(model[key].isUnique && " UNIQUE") || ""},\n`;
  }
  sql +=
    "\tcreated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n\tmodified_at TIMESTAMP\n);";
  return sql;
}
