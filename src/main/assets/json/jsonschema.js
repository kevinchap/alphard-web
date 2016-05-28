// jshint ignore: start
/**
 * JSONSchema
 *
 * Usage:
 *  var data = { type: 'array', 'items': { 'type': 'string' } };
 *  var schema = new JSONSchema(schema);
 *  schema.test(['toto', '', 'ici']);//true
 *  schema.test(['toto', '', false]);//false because false is boolean
 *  schema.test("titine");//false because string passed
 */
define([], function () {
  'use strict';

  /**
   * jsonschema module
   */
  var jsonschema = (function () {
    var
    ostring     = {}.toString,
    isUndefined = function (o) { return typeof o === "undefined"; },
    isNull      = function (o) { return o === null; },
    isObject    = function (o) { return (typeof o === "object") && (o !== null); },
    isFunction  = function (o) { return typeof o === "function"; },
    isBoolean   = function (o) { return ostring.call(o) === "[object Boolean]" },
    isNumber    = function (o) { return ostring.call(o) === "[object Number]" },
    isString    = function (o) { return ostring.call(o) === "[object String]" },
    isArray     = function (o) { return ostring.call(o) === "[object Array]" },
    isDate      = function (o) { return ostring.call(o) === "[object Date]" },
    isInteger   = function (o) { return isNumber(o) && o % 1 === 0; },
    merge       = function (dest, src) {
      if (src) {
        for (var propertyName in src) {
          if (src.hasOwnProperty(propertyName)) {
            dest[propertyName] = src[propertyName];
          }
        }
      }
      return dest;
    };

    /**
     * JSONSchema Draft 4
     *
     */
    var JSONSchema_Draft4 = {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "id": "http://json-schema.org/draft-04/schema#",
      "type": "object",
      "properties": {
        "type": {
          "type": [
            {
              "id": "#simple-type",
              "type": "string",
              "enum": ["object","array","string","number","boolean","null","any"]
            },
            "array"
          ],
          "items": { "type": [ { "$ref": "#simple-type" }, { "$ref": "#" } ] },
          "uniqueItems": true,
          "default": "any"
        },
        "disallow": {
          "type": ["string", "array"],
          "items": {
            "type": [ "string", { "$ref": "#" } ]
          },
          "uniqueItems": true
        },
        "extends": {
          "type": [ { "$ref": "#" }, "array" ],
          "items": { "$ref": "#" },
          "default": { }
        },
        "enum": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true
        },
        "minimum": {
          "type": "number"
        },
        "maximum": {
          "type": "number"
        },
        "exclusiveMinimum": {
          "type": "boolean",
          "default": false
        },
        "exclusiveMaximum": {
          "type": "boolean",
          "default": false
        },
        "divisibleBy": {
          "type": "number",
          "minimum": 0,
          "exclusiveMinimum": true,
          "default": 1
        },
        "minLength": {
          "type": "integer",
          "minimum": 0,
          "default": 0
        },
        "maxLength": {
          "type": "integer"
        },
        "pattern": {
          "type": "string"
        },
        "items": {
          "type": [ { "$ref": "#" }, "array" ],
          "items": { "$ref": "#" }, "default": { }
        },
        "additionalItems": {
          "type": [ { "$ref": "#" }, "boolean" ],
          "default": { }
        },
        "minItems": {
          "type": "integer",
          "minimum": 0,
          "default": 0
        },
        "maxItems": {
          "type": "integer",
          "minimum": 0
        },
        "uniqueItems": {
          "type": "boolean",
          "default": false
        },
        "properties": {
          "type": "object",
          "additionalProperties": { "$ref": "#" },
          "default": { }
        },
        "patternProperties": {
          "type": "object",
          "additionalProperties": { "$ref": "#" },
          "default": { }
        },
        "additionalProperties": {
          "type": [ { "$ref": "#" }, "boolean" ],
          "default": { }
        },
        "minProperties": {
          "type": "integer",
          "minimum": 0,
          "default": 0
        },
        "maxProperties": {
          "type": "integer",
          "minimum": 0
        },
        "required": {
          "type": "array",
          "items": { "type": "string" }
        },
        "dependencies": {
          "type": "object",
          "additionalProperties": {
            "type": [ "string", "array", { "$ref": "#" } ],
            "items": { "type": "string" }
          },
          "default": { }
        },
        "id": {
          "type": "string"
        },
        "$ref": {
          "type": "string"
        },
        "$schema": {
          "type": "string"
        },
        "title": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "default": {
          "type": "any"
        }
      },
      "dependencies": {
        "exclusiveMinimum": "minimum",
        "exclusiveMaximum": "maximum"
      },
      "default": { }
    };

    /**
     * JSONSchemaError class
     *
     */
    var JSONSchemaError = (function (_super) {
      /**
       * @constructor
       * @param {*} value
       */
      function JSONSchemaError(message, property) {
        if (this instanceof JSONSchemaError) {
          _super.call(this);
          this.message = message;
          this.property = property;

          //__stack(this, this.constructor);
        } else {
          return new JSONSchemaError(message, property);
        }
      }

      JSONSchemaError.displayName = "JSONSchemaError";

      JSONSchemaError.prototype = Object.create(_super.prototype);

      JSONSchemaError.prototype.constructor = JSONSchemaError;

      return JSONSchemaError;
    }(Error));

    /**
     * JSONSchema class
     *
     */
    var JSONSchema = (function (_super) {

      /**
       * @constructor
       * @param {*} dataOrSchema
       */
      function JSONSchema(dataOrSchema) {
        if (this instanceof JSONSchema) {
          _super.call(this);
          this._data = dataOrSchema;
        } else if (dataOrSchema instanceof JSONSchema) {
          return dataOrSchema;
        } else {
          return new JSONSchema(dataOrSchema);
        }
      }

      JSONSchema.displayName = "JSONSchema";

      JSONSchema.Integer = { type: "integer" };
      JSONSchema.validate = function validate(schema, instance, opt_options) {
        return JSONSchema(schema).validate(instance, opt_options);
      };
      JSONSchema.test = function test(schema, instance, opt_options) {
        return JSONSchema(schema).test(instance, opt_options);
      };

      JSONSchema.prototype = Object.create(_super.prototype);

      JSONSchema.prototype.constructor = JSONSchema;

      /**
       * @param {*} instance
       * @param {object} options
       * - throws : validation should throw error instead or returning result
       * - changing
       */
      JSONSchema.prototype.validate = function validate(instance, opt_options) {

        //options.changing = false;

        var
        options = merge({}, opt_options),
        data    = this._data,
        result  = validateAny(instance, data, options),
        errors  = result.errors,
        errorc  = errors.length, i, s = "", error;

        if (options["throws"]) {
          if (!result.valid) {
            s += r(instance);
            for (i = 0; i < errorc; i++) {
              error = result.errors[i];
              s += "\n  ";
              if (error.property) {
                s += '[' + error.property + '] : ';
              }
              s += error.message;
            }
            throw new TypeError(s);
          }
        }
        return result;
      };

      /**
       * @param {*} instance
       * @param {object} opt_options
       * @return {boolean}
       */
      JSONSchema.prototype.test = function test(instance, opt_options) {
        opt_options = merge({}, opt_options);
        opt_options["throws"] = false;
        return this.validate(instance, opt_options).valid;
      };

      /**
       * @return {object}
       */
      JSONSchema.prototype.toJSON = function toJSON() {
        return this._data;
      };

      /**
       * @return {string}
       */
      JSONSchema.prototype.toString = function toString() {
        return 'JSONSchema(' + JSON.stringify(this) + ')';
      };


      function validateAny(instance, schema, options) {
        //if (!options) options = {};

        var ctx = createContext(options);
        if (schema) {
          validateProperty(instance, schema, '', options.changing || '', ctx);
        }
        if (!options.changing && instance && instance.$schema) {
          validateProperty(instance, instance.$schema, '', '', ctx);
        }
        return {
          valid: !ctx.errors.length,
          errors: ctx.errors
        };
      }

      function validateRequired(value, schema, path, ctx) {
        if (isUndefined(value) && schema.required) {
          ctx.errors.push(JSONSchemaError("is missing and is required", path));
        }
      }

      function validateType(value, schema, path, ctx) {
        var
        schemaType     = typeGet(schema),
        schemaDisallow = schema.disallow,
        errors         = ctx.errors;

        arrayUpdate(errors, typeCheck(schemaType, value, path));
        if (schemaDisallow && !typeCheck(schemaDisallow, value, path).length) {
          errors.push(JSONSchemaError("disallowed value was matched", path));
        }
      }

      function validateString(value, schema, path, ctx) {
        var errors, valueLength, schemaPattern, schemaMinLength, schemaMaxLength;

        if (isString(value)) {
          errors         = ctx.errors;
          valueLength    = value.length;
          schemaPattern  = schema.pattern;
          schemaMinLength  = schema.minLength;
          schemaMaxLength  = schema.maxLength;

          if (schemaPattern && !value.match(schemaPattern)) {
            errors.push(
              JSONSchemaError("does not match the regex pattern " + schemaPattern, path)
            );
          }
          if (!isUndefined(schemaMaxLength) && valueLength > schemaMaxLength) {
            errors.push(
              JSONSchemaError("may only be " + schemaMaxLength + " characters long", path)
            );
          }
          if (!isUndefined(schemaMinLength) && valueLength < schemaMinLength) {
            errors.push(
              JSONSchemaError("must be at least " + schemaMinLength + " characters long", path)
            );
          }
        }
        return errors;
      }

      function validateNumber(value, schema, path, ctx) {
        if (isNumber(value)) {
          //TODO validate minimum etc.
        }
      }

      function validateArray(value, schema, path, ctx) {
        if (isArray(value)) {
          var
          coerce             = ctx.options.coerce,
          errors             = ctx.errors,
          valueLength        = value.length,
          schemaItems        = schema.items,
          schemaItemsIsArray = isArray(schemaItems),
          schemaMinItems     = schema.minItems,
          schemaMaxItems     = schema.maxItems,
          propDef            = schemaItems, i;

          if (schemaItems) {
            for (i = 0; i < valueLength; i += 1) {
              if (schemaItemsIsArray) {
                propDef = schemaItems[i];
              }
              if (coerce) {
                value[i] = coerce(value[i], propDef);
              }
              validateProperty(value[i], propDef, path, i, ctx);
            }
          }
          if (!isUndefined(schemaMinItems) && valueLength < schemaMinItems) {
            errors.push(
            JSONSchemaError("There must be a minimum of " + schemaMinItems + " in the array", path)
            );
          }
          if (!isUndefined(schemaMaxItems) && valueLength > schemaMaxItems) {
            errors.push(
            JSONSchemaError("There must be a maximum of " + schemaMaxItems + " in the array", path)
            );
          }
        }
      }

      function validateMinMax(value, schema, path, ctx) {
        var
        errors      = ctx.errors,
        schemaMin   = schema.minimum,
        schemaMax   = schema.maximum,
        typeOfValue = typeof value;
        if (
          !isUndefined(schemaMin) &&
          typeOfValue === typeof schemaMin &&
          schemaMin > value
        ) {
          errors.push(
            JSONSchemaError("must have a minimum value of " + schemaMin, path)
          );
        }
        if (
          !isUndefined(schemaMax) &&
          typeOfValue === typeof schemaMax &&
          schemaMax < value
        ) {
          errors.push(
            JSONSchemaError("must have a maximum value of " + schemaMax, path)
          );
        }
      }

      function validateEnum(value, schema, path, ctx) {
        var enumer = schema['enum'], found = false, l, j;
        if (enumer) {
          l = enumer.length;
          for (j = 0; j < l; j++) {
            if (enumer[j] === value) {
              found = true;
              break;
            }
          }
          if (!found) {
            ctx.errors.push(JSONSchemaError("does not have a value in the enumeration " + enumer.join(", "), path));
          }
        }
      }

      function validateProperties(value, schema, path, ctx) {
        var
        properties = schema.properties,
        additionalProperties = schema.additionalProperties;

        if (properties || additionalProperties) {
          validateObject(value, properties, path, additionalProperties, ctx);
          /*arrayUpdate(
            ctx.errors,
            validateObject(value, properties, path, additionalProperties, ctx)
          );*/
        }
      }

      function validateProperty(value, schema, path, index, ctx) {
        var errors = ctx.errors;

        path += path ? isNumber(index) ? '[' + index + ']' : !index ? '' : '.' + index : index;

        if (
          !(isObject(schema)/* || isArray(schema)*/) &&
          (path || isFunction(schema)) &&
          !(schema && typeGet(schema))
        ) {
          if (isFunction(schema)) {
            if (!(value instanceof schema)) {
              errors.push(
                JSONSchemaError("is not an instance of " + schema.name, path)
              );
            }
          } else if (schema) {
            errors.push(
              JSONSchemaError("Invalid schema/property definition " + schema, path)
            );
          }
          return null;
        }

        if (ctx.options.changing && schema.readonly) {
          errors.push(
            JSONSchemaError("is a readonly field, it can not be changed", path)
          );
        }
        if (schema['extends']) {
          // if it extends another schema, it must pass that schema as well
          validateProperty(value, schema['extends'], path, index, ctx);
        }

        validateRequired(value, schema, path, ctx);
        if (!isUndefined(value)) {
          validateType(value, schema, path, ctx);
          if (value !== null) {
            validateProperties(value, schema, path, ctx);
            validateArray(value, schema, path, ctx);
            validateString(value, schema, path, ctx);
            validateMinMax(value, schema, path, ctx);
            validateEnum(value, schema, path, ctx);
            validateNumber(value, schema, path, ctx);
          }
        }

      }

      function validateObject(instance, objTypeDef, path, additionalProp, ctx) {
        var propertyName, value, propDef, coerce;
        var errors = ctx.errors;

        if (isObject(objTypeDef)) {
          if (!isObject(instance)/* || isArray(instance)*/) {
            errors.push(JSONSchemaError("an object is required", path));
          } else {
            coerce = ctx.options.coerce;
            for (propertyName in objTypeDef) {
              if (objTypeDef.hasOwnProperty(propertyName)) {
                value = instance[propertyName];
                propDef = objTypeDef[propertyName];

                // skip _not_ specified properties
                if (isUndefined(value) && ctx.options.existingOnly) continue;

                // set default
                if (isUndefined(value) && !isUndefined(propDef["default"])) {
                  value = instance[propertyName] = propDef["default"];
                }
                if (coerce && propertyName in instance) {
                  value = instance[propertyName] = coerce(value, propDef);
                }
                validateProperty(value, propDef, path, propertyName, ctx);
              }
            }
          }
        }

        for (propertyName in instance) {
          if (instance.hasOwnProperty(propertyName)) {
            if (
              !(propertyName.charAt(0) === '_' && propertyName.charAt(1) === '_') &&
              objTypeDef && !objTypeDef[propertyName] && additionalProp === false
            ) {
              if (options.filter) {
                delete instance[propertyName];
                continue;
              } else {
                errors.push(JSONSchemaError(
                  "Property " + r(propertyName) + " is not defined in the schema and the schema does not allow additional properties",
                  path
                ));
              }
            }
            var requires = objTypeDef && objTypeDef[propertyName] && objTypeDef[propertyName].requires;
            if (requires && !(requires in instance)) {
              errors.push(
              JSONSchemaError("the presence of the property " + propertyName + " requires that " + requires + " also be present", path)
              );
            }
            value = instance[propertyName];
            if (additionalProp && (!isObject(objTypeDef) || !(propertyName in objTypeDef))) {
              if (ctx.options.coerce) {
                value = instance[propertyName] = ctx.options.coerce(value, additionalProp);
              }
              validateProperty(value, additionalProp, path, propertyName, ctx);
            }
            if (!ctx.options.changing && value && value.$schema) {
              validateProperty(value, value.$schema, path, propertyName, ctx);
            }
          }
        }
        //return errors;
      }


      function typeGet(schema) {
        return schema.type || (typeGet[schema.name] === schema && schema.name.toLowerCase());
      }
      typeGet["String"] = String;
      typeGet["Boolean"] = Boolean;
      typeGet["Number"] = Number;
      typeGet["Object"] = Object;
      typeGet["Array"] = Array;
      typeGet["Date"] = Date;


      function typeCheck(type, value, property) {
        var errors;
        if (isString(type) && !typeCheck[type](value)) {

          errors = [JSONSchemaError(
            r(value) + ' is not a valid ' + type,
            property
          )];
        } else if (isArray(type)) {
          var j, l = type.length;
          for (j = 0; j < l; j++) { // a union type
            errors = typeCheck(type[j], value, property);
            if (!errors.length) {
              break;
            }
          }
          if (errors && errors.length) {
            errors = [JSONSchemaError(
              r(value) + ' is not a valid ' + type.join('|'),
              property
            )];
          }
        } else if (isObject(type)) {
          var ctx = createContext();
          validateProperty(value, type, property, property, ctx);
          errors = ctx.errors;
        }
        return errors || [];
      }
      typeCheck["any"] = function (o) { return true; };
      typeCheck["array"] = isArray;
      typeCheck["boolean"] = isBoolean;
      typeCheck["date"] = isDate;
      typeCheck["function"] = isString;
      typeCheck["integer"] = isInteger;
      typeCheck["null"] = isNull;
      typeCheck["number"] = isNumber;
      typeCheck["object"] = isObject;
      typeCheck["string"] = isString;

      function r(o) {
        var s = String(o);
        return s.charAt[0] === "[" ? s : '`' + s + '`';
      }

      function arrayUpdate(a, tail) {
        for (var i = 0, l = tail.length; i < l; ++i) {
          a.push(tail[i]);
        }
        return a;
      }

      function createContext(options) {
        return { errors: [], options: options || {} };
      }

      return JSONSchema;
    }(Object));

    //exports
    return {
      Error: JSONSchemaError,
      Schema: JSONSchema
    };
  }());





  return jsonschema;
});
