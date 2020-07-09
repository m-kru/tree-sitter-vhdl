module.exports = grammar({
  name: 'vhdl',

  word: $ => $.basic_identifier,

  extras: $ => [
    /\s/,
    $.single_line_comment,
//    $.block_comment
  ],

  rules: {
    source_file: $ => repeat($.design_file),

    // ########################################################################
    // 3 Design entities and configurations
    // ########################################################################

    // 3.2 Entity declarations

    // 3.2.1 General

    entity_declaration: $ => seq(
      'entity', $.identifier, 'is',
      //$.entity_header,
      //$.entity_declarative_part,
      //optional(seq('begin', $.entity_statement_part)),
      'end', optional('entity'), optional($.entity_simple_name)
    ),

    entity_simple_name: $ => $.identifier,

    // ########################################################################
    // 5 Types
    // ########################################################################

    // 5.2 Scalar types

    // 5.2.1 General

    range: $ => choice(
      //$.range_attribute_name,
      $.simple_range,
      //$.range_expression
    ),

    simple_range: $ => seq($.simple_expression, $.direction, $.simple_expression),

    direction: $ => choice(
      'to',
      'downto'
    ),

    // 5.2.4 Physical types

    // 5.2.4.1 General

    physical_literal: $ => seq(optional($.abstract_literal), $.unit_name),

    unit_name: $ => $.name,

    // 5.3.2 Array types

    // 5.3.2.1 General

    discrete_range: $ => choice(
    //  $.discrete_subtype_indication,
      $.range
    ),

    // ########################################################################
    // 6 Declarations
    // ########################################################################

    // 6.3 Subtype declarations

    type_mark: $ => choice(
      $.type_name,
      $.subtype_name
    ),

    type_name: $ => $.name,

    subtype_name: $ => $.name,

    // ########################################################################
    // 8 Names
    // ########################################################################

    // 8.1 General

    name: $ => choice(
      $.simple_name,
      //$.operator_symbol,
      //$.character_literal,
      //$.selected_name,
      //$.indexed_name,
      //$.slice_name,
      //$.attribute_name,
      //$.external_name,
    ),

    simple_name: $ => $.identifier,

    // ########################################################################
    // 9 Expressions
    // ########################################################################

    // 9.1 General

    conditional_or_unaffected_expression: $ => seq(
      $.expression_or_unaffected,
      repeat(seq('when', $.condition, 'else', $.expression_or_unaffected)),
      optional(seq('when', $.condition))
    ),

    expression_or_unaffected: $ => choice(
      $.expression,
      'unaffected'
    ),

    conditional_expression: $ => seq(
      $.expression,
      repeat(seq('when', $.condition, 'else', $.expression))
    ),

    expression: $ => choice(
      seq($.condition_operator, $.primary),
      $.logical_expression,
    ),

    logical_expression: $ => choice(
      seq($.relation, repeat(seq('and', $.relation))),
      seq($.relation, repeat(seq('or', $.relation))),
      seq($.relation, repeat(seq('xor', $.relation))),
      seq($.relation, optional(seq('nand', $.relation))),
      seq($.relation, optional(seq('nor', $.relation))),
      seq($.relation, repeat(seq('xnor', $.relation))),
    ),

    relation: $ => seq(
      $.shift_expression,
      optional(seq($.relational_operator, $.shift_expression))
    ),

    shift_expression: $ => seq(
      $.simple_expression,
      optional(seq($.shift_operator, $.simple_expression))
    ),

    simple_expression: $ => seq(
      optional($.sign),
      $.term,
      repeat(seq($.adding_operator, $.term))
    ),

    term: $ => seq(
      $.factor,
      repeat(seq($.expression_or_unaffected, $.factor))
    ),

    factor: $ => seq(
      $.unary_expression,
      optional(seq($.binary_miscellaneous_operator, $.unary_expression))
    ),

    unary_expression: $ => choice(
      $.primary,
      seq('abs', $.primary),
      seq('not', $.primary),
      //seq($.unary_logical_operator, $.primary)
    ),

    primary: $ => choice(
      $.name,
      $.literal,
      $.aggregate,
      $.function_call,
      $.qualified_expression,
      $.type_conversion,
      $.allocator,
      seq('(', $.conditional_expression, ')')
    ),

    condition: $ => $.expression,

    // 9.2 Operators
    condition_operator: $ => seq('??'),

    logical_operator: $ => choice('and', 'or', 'nand', 'nor', 'xor', 'xnor'),

    relational_operator: $ => choice('=', '/=', '<', '<=', '>', '>=', '?=', '?/=', '?<', '?<=', '?>', '?>='),

    shift_operator: $ => choice('sll', 'srl', 'sla', 'sra', 'rol', 'ror'),

    adding_operator: $ => choice('+', '–', '&'),

    sign: $ => choice('+', '–'),

    multiplying_operator: $ => choice('*', '/', 'mod', 'rem'),

    binary_miscellaneous_operator: $ => seq('**'),

    unary_miscellaneous_operator: $ => choice('abs', 'not', 'unary_logical_operator'),

    // 9.3 Operands
    literal: $ => choice(
      $.numeric_literal,
      //$.enumeration_literal,
      //$.string_literal,
      //$.bit_string_literal,
      'null'
    ),

    numeric_literal: $ => choice(
      $.abstract_literal,
      $.physical_literal
    ),

    // 9.3.3 Aggregates
    aggregate: $ => seq(
      '(',
      $.element_association,
      repeat(seq(',',  $.element_association )),
      ')'
    ),

    element_association: $ => seq(
      optional(seq($.choices, '=>')),
      $.expression
    ),

    choices: $ => seq(
      $.choice_,
      repeat(seq('|', $.choice_)),
    ),

    choice_: $ => choice(
      $.simple_expression,
      $.discrete_range,
      //$.element_simple_name,
      "others"
    ) ,

    // 9.3.4 Function calls
    function_call: $ => seq(
      $.function_name,
      //optional(generic_map_aspect),
      //optional(parameter_map_aspect)
    ),

    function_name: $ => $.name,

    parameter_map_aspect: $ => seq(
      optional(seq('parameter', 'map')),
      '(',
//      $.parameter_association_list,
      ')',
    ),

    // 9.3.5 Qualified expressions
    qualified_expression: $ => choice(
      seq($.type_mark, "'", '(', $.expression, ')'),
      seq($.type_mark, "'", $.aggregate),
      seq($.type_mark, "'", '(', ')'),
    ),

    // 9.3.6 Type conversions
    type_conversion: $ => seq($.type_mark, '(', $.expression, ')'),

    // 9.3.7 Allocators
    allocator: $ => choice(
      //seq('new', $.subtype_indication, optional($.generic_map_aspect)),
      seq('new', $.qualified_expression)
    ),

    // ########################################################################
    // 13 Design units and their analysis
    // ########################################################################

    // 13.1 Design units

    design_file: $ => repeat1($.design_unit),

    design_unit: $ => seq(
    //  $.context_clause,
      $.library_unit
    ),

    library_unit: $ => choice(
      $.primary_unit,
    //  $.secondary_unit
    ),

    primary_unit: $ => choice(
      $.entity_declaration,
    //  $.configuration_declaration,
    //  $.package_declaration,
    //  $.package_instantiation_declaration,
    //  $.context_declaration,
    //  //$.PSL_verification_unit
    ),

    //secondary_unit: $ => choice(
    //  $.architecture_body,
    //  $.package_body
    //),

    // 13.4 Context clauses
    //context_clause: $ => repeat(
    //  $.context_item
    //),

    //context_item: $ => choice(
    //  $.library_clause,
    //  $.use_clause,
    //  $.context_reference
    //),

    //type_declaration: $ => choice(
    //  $.full_type_declaration,
//  //    $.incomplete_type_declaration
    //),

    ///full_type_declaration: $ => seq(
    ///  'type',
    ///  $.identifier,
    ///  'is',
    ///  $.type_definition
    ///),

    //type_definition: $ => choice(
    //  $.scalar_type_definition,
    ////  $.composite_type_definition,
    ////  $.access_type_definition,
    ////  $.file_type_definition,
    ////  $.protected_type_definition,
    ////  $.protected_type_instantiation_definition
    //),

    //scalar_type_definition: $ => choice(
    ////  enumeration_type_definition,
    //  integer_type_definition,
    ////  floating_type_definition,
    ////  physical_type_definition
    //),

    //integer_type_definition: $ => seq(
    //  $.range_constraint
    //),

    //range_constraint: $ => seq(
    //  'range',
    //  $.range
    //),

    //incomplete_type_declaration: $ => seq(
    //),
    
    // ########################################################################
    // 15 Lexical elements
    // ########################################################################

    // 15.2 Character set
    basic_graphic_character: $ => choice(
    //  $.upper_case_letter,
      $.digit,
    //  $.special_character,
    //  $.space_character
    ),

    graphic_character: $ => choice(
      //$.basic_graphic_character,
      $.lower_case_letter,
      //$.other_special_character
    ),

    digit: $ => /\d/,

    lower_case_letter: $ => /[a-z]/,

    // 15.4 Identifiers

    identifier: $ => choice(
      $.basic_identifier,
      $.extended_identifier,
    ),

    basic_identifier: $ => /([A-Z]|[a-z]|[0-9]|_)+/,

    extended_identifier: $ => /\\([A-Z]|[a-z]|[0-9]|_|\\)+\\/,

    // 15.5 Abstract literals

    // 15.5.1 General

    abstract_literal: $ => choice(
      $.decimal_literal,
      //$.based_literal
    ),

    // 15.5.2 Decimal literals
    decimal_literal: $ => seq(
      $.integer,
      optional(seq('.', $.integer)),
      //optional($.exponent)
    ),

    // TODO: Fix regex for 123_12312_, '_' is not allowed at the end.
    integer: $ => /\d([\d|_])*/,

    // 15.6 Character literals

    character_literal: $ => seq("'", $.graphic_character, "'"),

    // 15.7 String literals

    string_literal: $ => seq('"', repeat($.graphic_character), '"'),

    // 15.9 Comments

    comment: $ => choice(
      $.single_line_comment,
      $.delimited_comment
    ),

//    single_line_comment: $ => token(seq(
//      '--', /.*/
//    )),
//  TODO: Remove above if below works.
    single_line_comment: $ => token(/--.*/),

    delimited_comment: $ => seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/'
    ),
    
  }
});
