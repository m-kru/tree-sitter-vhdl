module.exports = grammar({
  name: 'vhdl',

  word: $ => $.basic_identifier,

  extras: $ => [
    /\s/,
    $.single_line_comment,
//    $.block_comment
  ],

  conflicts: $ => [
    [$._type_mark, $.prefix],
    [$.unit_name, $.prefix],
  ],

  rules: {
    source_file: $ => seq($._design_file),

    _semicolon: $ => seq(';'),

    // ########################################################################
    // Section for names not explicitly defined in the LRM, but used
    // in the rules definitions. They usually result from the 1.3.2 g). 
    // ########################################################################

    entity_simple_name: $ => $._simple_name,

    _formal_generic_clause: $ => $.generic_clause,

    _formal_port_clause: $ => $.port_clause,

    _return_identifier: $ => $._identifier,

    record_type_simple_name: $ => $._simple_name,

    record_element_simple_name: $ => $._simple_name,

    file_incomplete_type_mark: $ => $.incomplete_type_mark,

    resolution_function_name: $ => $._name,

    static_conditional_expression: $ => $.conditional_expression,

    _signal_mode_indication: $ => $._mode_indication,

    signal_name: $ => $._name,

    variable_name: $ => $._name,

    file_name: $ => $._name,

    subprogram_name: $ => $._name,

    instantiated_package_name: $ => $._name,

    _generic_association_list: $ => $.association_list,

    function_name: $ => $._name,

    _context_simple_name: $ => $._simple_name,

    physical_type_simple_name: $ => $._simple_name,

    // ########################################################################
    // 3 Design entities and configurations
    // ########################################################################

    // 3.2 Entity declarations

    // 3.2.1 General

    entity_declaration: $ => prec.right(seq(
      'entity', $._identifier, 'is',
      optional($._formal_generic_clause),
      optional($._formal_port_clause),
      repeat($._entity_declarative_item),
      //optional(seq('begin', $.entity_statement_part)),
      'end', optional('entity'), optional($.entity_simple_name),
      $._semicolon
    )),

    // 3.2.2 Entity header

    // entity_header rule gives following error during generation:
    // "The rule `entity_header` matches the empty string."
    // This is why '_formal_generic_clause' and 'formal_port_clause' have been
    // moved directly to the 'entity declaration' rule.
    //entity_header: $ => seq(
    //  optional($.formal_generic_clause),
    //  optional($.formal_port_clause)
    //),

    // 3.2.3 Entity declarative part

    _entity_declarative_item: $ => choice(
      $.subprogram_declaration,
      //$.subprogram_body,
      //$.subprogram_instantiation_declaration,
      //$.package_declaration,
      //$.package_body,
      //$.package_instantiation_declaration,
      $.type_declaration,
      //$.subtype_declaration,
      //$.mode_view_declaration,
      //$.constant_declaration,
      //$.signal_declaration,
      //$.shared_variable_declaration,
      //$.file_declaration,
      $.alias_declaration,
      //$.attribute_declaration,
      //$.attribute_specification,
      //$.disconnection_specification,
      //$.use_clause,
      //$.group_template_declaration,
      //$.group_declaration,
      //$.PSL_Property_Declaration,
      //$.PSL_Sequence_Declaration,
      //$.PSL_Clock_Declaration,
    ),

    // ########################################################################
    // 4 Subprograms and packages
    // ########################################################################

    // 4.2 Subprogram declarations

    // 4.2.1 General

    subprogram_declaration: $ => seq(
      $._subprogram_specification ,
      $._semicolon
    ),

    _subprogram_specification: $ => choice(
      $.procedure_specification,
      $.function_specification
    ),

    procedure_specification: $ => seq(
      'procedure',
      $._designator,
      optional($.subprogram_header),
      optional(seq(optional('parameter'), '(', $._formal_parameter_list, ')'))
    ),

    function_specification: $ => seq(
      optional(choice('pure', 'impure')),
      'function',
      $._designator,
      optional($.subprogram_header),
      optional(seq(optional('parameter'), '(', $._formal_parameter_list, ')')),
      'return',
      optional(seq($._return_identifier, 'of')),
      $._type_mark
    ),

    subprogram_header: $ => seq(
      'generic',
      '(', $._generic_list, ')',
      optional($.generic_map_aspect)
    ),

    _designator: $ => choice(
      $._identifier,
      $.operator_symbol
    ),

    operator_symbol: $ => $.string_literal,

    // 4.2.2 Formal parameters

    // 4.2.2.1 Formal parameter lists

    _formal_parameter_list: $=>  $.parameter_interface_list,

    parameter_interface_list: $ => seq(
      $.interface_object_declaration,
      repeat(seq(';', $.interface_object_declaration)),
      optional($._semicolon)
    ),

    // 4.5.3 Signatures

    signature: $ => seq(
      '[',
      optional(seq($._type_mark, repeat(seq(',', $._type_mark)))),
      optional(seq('return', $._type_mark)),
      ']'
    ),

    // ########################################################################
    // 5 Types
    // ########################################################################

    // 5.2 Scalar types

    // 5.2.1 General

    scalar_type_definition: $ => choice(
      $.enumeration_type_definition,
      // Both integer type and floating type have the same definition.
      // This is why range_constraint has to be used.
      //$.integer_type_definition,
      //$.floating_type_definition,
      $.range_constraint,
      $.physical_type_definition
    ),

    range_constraint: $ => seq(
      'range',
       $.range
    ),

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

    // 5.2.2 Enumeration types

    // 5.2.2.1 General

    enumeration_type_definition: $ => seq(
      '(',
      $.enumeration_literal,
      repeat(seq(',', $.enumeration_literal)),
      ')'
    ),

    enumeration_literal: $ => choice(
      $._identifier,
      $.character_literal
    ),

    // 5.2.3 Integer types

    // 5.2.3.1 General

    integer_type_definition: $ => $.range_constraint,

    // 5.2.4 Physical types

    // 5.2.4.1 General

    physical_type_definition: $ => seq(
      $.range_constraint,
      'units',
      $.primary_unit_declaration,
      repeat($.secondary_unit_declaration),
      'end', 'units', optional($.physical_type_simple_name)
    ),

    primary_unit_declaration: $ => seq(
      $._identifier,
      $._semicolon
    ),

    secondary_unit_declaration: $ => seq(
      $._identifier,
      '=',
      $.physical_literal,
      $._semicolon
    ),

    physical_literal: $ => seq(optional($.abstract_literal), $.unit_name),

    unit_name: $ => $._name,

    // 5.2.5 Floating-point types

    // 5.2.5.1 General

    floating_type_definition: $ => $.range_constraint,

    // 5.3.2 Array types

    // 5.3.2.1 General

    array_type_definition: $ => choice(
      $.unbounded_array_definition,
      $.constrained_array_definition
    ),

    unbounded_array_definition: $ => seq(
      'array', 
      '(',
      $.index_subtype_definition,
      repeat(seq(',', $.index_subtype_definition)),
      ')',
      'of',
      $.element_subtype_indication
    ),

    element_subtype_indication: $ => $.subtype_indication,

    constrained_array_definition: $ => seq(
      'array',
      $.index_constraint,
      'of',
      $.element_subtype_indication
    ),

    index_subtype_definition: $ => seq(
      $._type_mark,
      'range',
      '<',
      '>'
    ),

    array_constraint: $ => prec.left(seq(
      $.index_constraint,
      optional($.array_element_constraint),
      seq('(', 'open', ')'),
      optional($.array_element_constraint)
    )),

    array_element_constraint: $ => $.element_constraint,

    index_constraint: $ => seq(
      '(',
      $.discrete_range,
      repeat(seq( ',', $.discrete_range)),
      ')'
    ),

    discrete_range: $ => choice(
    //  $.discrete_subtype_indication,
      $.range
    ),

    // 5.3.3 Record types

    // 5.3.3.1 General

    record_type_definition: $ => seq(
      'record',
      repeat($.element_declaration),
      'end', 'record', optional($.record_type_simple_name)
    ),

    element_declaration: $ => seq(
      $.identifier_list,
      ':',
      $.element_subtype_definition,
      $._semicolon
    ),

    identifier_list: $ => seq(
      $._identifier,
      repeat(seq(',', $._identifier))
    ),

    element_subtype_definition: $ => $.subtype_indication,

    record_constraint: $ => seq(
      '(',
      $.record_element_constraint,
      repeat(seq(',', $.record_element_constraint)),
      ')'
    ),

    record_element_constraint: $ => seq(
      $.record_element_simple_name,
      $.element_constraint
    ),

    // 5.5 File types

    // 5.5.1 General

    file_type_definition: $ => seq('file', 'of', $._type_mark),

    // 5.8 Unspecified types

    // 5.8.1 General

    unspecified_type_indication: $=> seq(
      'type',
      'is',
      $.incomplete_type_definition
    ),

    incomplete_type_definition: $ => choice(
      $.private_incomplete_type_definition,
      $.scalar_incomplete_type_definition,
      $.discrete_incomplete_type_definition,
      $.integer_incomplete_type_definition,
      $.physical_incomplete_type_definition,
      $.floating_incomplete_type_definition,
      $.array_incomplete_type_definition,
      $.access_incomplete_type_definition,
      $.file_incomplete_type_definition
    ),

    incomplete_subtype_indication: $ => choice(
      $.subtype_indication,
      $.unspecified_type_indication
    ),

    incomplete_type_mark: $ => choice(
      $._type_mark,
      $.unspecified_type_indication
    ),

    private_incomplete_type_definition: $ => seq('private'),

    scalar_incomplete_type_definition: $ => seq('<', '>'),

    discrete_incomplete_type_definition: $ => seq('(', '<', '>', ')'),

    integer_incomplete_type_definition: $ => seq('range', '<', '>'),

    physical_incomplete_type_definition: $ => seq('units', '<', '>'),

    floating_incomplete_type_definition: $ => seq('range', '<', '>', '.', '<', '>'),

    array_incomplete_type_definition: $ => seq(
      'array',
      '(',
      $.array_index_incomplete_type_list,
      ')',
      'of',
      $.element_incomplete_subtype_indication
    ),

    element_incomplete_subtype_indication: $=> $.incomplete_subtype_indication,

    array_index_incomplete_type_list: $=> seq(
      $.array_index_incomplete_type,
      seq(',', $.array_index_incomplete_type)
    ),

    array_index_incomplete_type: $ => choice(
      $.index_subtype_definition,
      $.index_constraint,
      $.unspecified_type_indication
    ),

    access_incomplete_type_definition: $ => seq(
      'access',
      $.access_incomplete_subtype_indication
    ),

    access_incomplete_subtype_indication: $ => $.incomplete_subtype_indication,

    file_incomplete_type_definition: $ => seq(
      'file',
      'of',
      $.file_incomplete_type_mark
    ),

    // ########################################################################
    // 6 Declarations
    // ########################################################################

    // 6.2 Type declarations

    type_declaration: $ => choice(
      $.full_type_declaration,
      //$.incomplete_type_declaration
    ),

    full_type_declaration: $ => seq(
      'type',
      $._identifier,
      'is',
      $.type_definition,
      $._semicolon
    ),

    type_definition: $ => choice(
      $.scalar_type_definition,
    //  $.composite_type_definition,
    //  $.access_type_definition,
      $.file_type_definition,
    //  $.protected_type_definition,
    //  $.protected_type_instantiation_definition
    ),

    // 6.3 Subtype declarations

    subtype_declaration: $ => seq(
      'subtype',
      $._identifier,
      'is',
      $.subtype_indication,
      $._semicolon
    ),

    subtype_indication: $ => seq(
      optional($.resolution_indication),
      $._type_mark,
      optional($.constraint)
    ),

    resolution_indication: $ => choice(
      $.resolution_function_name,
      seq('(', $.element_resolution, ')')
    ),

    element_resolution: $ => choice(
      $.array_element_resolution,
      $.record_resolution
    ),

    array_element_resolution: $ => $.resolution_indication,

    record_resolution: $ => seq(
      $.record_element_resolution,
      repeat(seq(',', $.record_element_resolution))
    ),

    record_element_resolution: $ => seq(
      $.record_element_simple_name,
      $.resolution_indication
    ),

    // While syntax tree is being built there is no way to distinguish
    // types names and subtype names. This is why following rules from
    // the standard:
    // _type_mark: $ => choice(
    //  $.type_name,
    //  $.subtype_name
    // ),
    // type_name: $ => $._name,
    // subtype_name: $ => $._name,
    // have been replaced with unequivocal one
    _type_mark: $ => $._name,

    constraint: $ => choice(
      $.range_constraint,
      $.array_constraint,
      $.record_constraint
    ),

    element_constraint: $ => choice(
      $.array_constraint,
      $.record_constraint
    ),

    // 6.5 Interface declarations

    // 6.5.1 General

    interface_declaration: $ => choice(
      $.interface_object_declaration,
      $.interface_type_declaration,
      $.interface_subprogram_declaration,
      //$.interface_package_declaration,
    ),

    // 6.5.2 Interface object declarations

    interface_object_declaration: $ => choice(
      $.interface_constant_declaration,
      $.interface_signal_declaration,
      $.interface_variable_declaration,
      $.interface_file_declaration,
    ),
    
    interface_constant_declaration: $ => prec(3,seq(
      optional('constant'),
      $.identifier_list,
      ':',
      optional('in'),
      $._interface_type_indication,
      optional(seq(':=', $.static_conditional_expression))
    )),

    interface_signal_declaration: $ => prec(2,seq(
      optional('signal'),
      $.identifier_list,
      ':',
      $._signal_mode_indication
    )),

    interface_variable_declaration: $ => prec(1,seq(
      optional('variable'),
      $.identifier_list,
      ':',
      optional($.mode),
      $._interface_type_indication,
      optional(seq(':=', $.static_conditional_expression))
    )),

    interface_file_declaration: $ => seq(
      'file',
      $.identifier_list,
      ':',
      $.subtype_indication
    ),

    _interface_type_indication: $ => choice(
      $.subtype_indication,
      $.unspecified_type_indication
    ),

    _mode_indication: $ => choice(
      $.simple_mode_indication,
      //$.mode_view_indication
    ),

    simple_mode_indication: $ => prec(2,seq(
      optional($.mode),
      $._interface_type_indication,
      optional('bus'),
      optional(seq(':=', $.static_conditional_expression))
    )),

    mode: $ => prec.left(choice('in', 'out', 'inout', 'buffer', 'linkage')),

    //mode_view_indication: $ => (
    //  $.record_mode_view_indication,
    //  $.array_mode_view_indication
    //),

    // 6.5.3

    // 6.5.3.1

    interface_type_declaration: $ => seq(
      'type',
      $._identifier,
      optional(seq('is', $.incomplete_type_definition))
    ),

    // 6.5.4 Interface subprogram declarations
    interface_subprogram_declaration: $ => seq(
      $._interface_subprogram_specification,
      optional(seq('is', $.interface_subprogram_default))
    ),

    _interface_subprogram_specification: $ => choice(
      $.interface_procedure_specification,
      $.interface_function_specification
    ),

    interface_procedure_specification: $ => seq(
      'procedure',
      $._designator,
      optional(seq(optional('parameter'), '(',  $._formal_parameter_list, ')'))
    ),

    interface_function_specification: $ => seq(
      optional(choice('pure', 'impure')),
      'function',
      $._designator,
      optional(seq(optional('parameter'), '(', $._formal_parameter_list, ')')),
      'return',
      $._type_mark
    ),

    interface_subprogram_default: $=> choice(
      $._name,
      seq('<', '>')
    ),

    // 6.5.6 Interface lists

    // 6.5.6.1 General

    interface_list: $ => seq(
      $.interface_element,
      repeat(seq(';', $.interface_element)),
      optional($._semicolon)
    ),

    interface_element: $ => $.interface_declaration,

    // 6.5.6.2 Generic clauses

    generic_clause: $ => seq(
      'generic',
      '(',
      $._generic_list,
      ')',
      $._semicolon
    ),

    _generic_list: $=> $.generic_interface_list,

    generic_interface_list: $ => seq(
      $.generic_interface_element,
      repeat(seq(';', $.generic_interface_element)),
      optional($._semicolon)
    ),

    generic_interface_element: $ => choice(
      $.interface_constant_declaration,
      $.interface_type_declaration,
      $.interface_subprogram_declaration,
    ),

    // 6.5.6.3 Port clauses

    port_clause: $ => seq(
      'port',
      '(',
      $.port_interface_list,
      ')',
      $._semicolon
    ),

    port_interface_list: $ => seq(
      $.port_interface_element,
      repeat(seq(';', $.port_interface_element)),
      optional($._semicolon)
    ),

    port_interface_element: $ => choice(
      $.interface_signal_declaration,
      $.interface_variable_declaration,
    ),

    // 6.5.7 Association lists

    // 6.5.7.1 General

    association_list: $ => seq(
      $.association_element,
      repeat(seq(',', $.association_element))
    ),

    association_element: $ => seq(
      optional(seq($.formal_part, '=>')),
      $.actual_part
    ),

    formal_part: $ => choice(
      $.formal_designator,
      seq($.function_name, '(', $.formal_designator, ')'),
      seq($._type_mark, '(', $.formal_designator, ')')
    ),

    formal_designator: $ => choice(
      // seq($.generic_name, optional($.signature)),
      // port_name and parameter_name can't be distinguished on sytnax parsing.
      // This is why name has to be used.
      //$.port_name,
      //$.parameter_name
      $._name
    ),

    actual_part: $ => choice(
      $.actual_designator,
      seq($.function_name, '(', $.actual_designator, ')'),
      seq($._type_mark, '(', $.actual_designator, ')')
    ),

    actual_designator: $ => choice(
      seq(optional('inertial'), $.conditional_expression),
      $.signal_name,
      $.variable_name,
      $.file_name,
      $.subtype_indication,
      $.subprogram_name,
      $.instantiated_package_name,
      'open'
    ),

    // 6.5.7.2

    generic_map_aspect: $ => seq(
      'generic', 'map',
      '(', $._generic_association_list, ')'
    ),

    // 6.6 Alias declarations

    alias_declaration: $ => seq(
      'alias',
      $._alias_designator,
      optional(seq(':', $.subtype_indication)),
      'is',
      $._name,
      optional($.signature),
      $._semicolon
    ),

    _alias_designator: $ => choice(
      $._identifier,
      $.character_literal,
      $.operator_symbol
    ),

    // ########################################################################
    // 8 Names
    // ########################################################################

    // 8.1 General

    _name: $ => prec(1,choice(
      $._simple_name,
      $.operator_symbol,
      $.character_literal,
      $.selected_name,
      $.indexed_name,
      $.slice_name,
      //$.attribute_name,
      //$.external_name,
    )),

    prefix: $ => choice(
      $._name,
    //  $.function_call
    ),

    // 8.3 Selected names

    selected_name: $ => seq(
      $.prefix,
      '.',
      $.suffix
    ),

    suffix: $ => choice(
      $._simple_name,
      $.character_literal,
      $.operator_symbol,
      'all'
    ),

    _simple_name: $ => $._identifier,

    // 8.4 Indexed names

    indexed_name: $ => seq(
      $.prefix,
      '(',
      $.expression,
      repeat(seq(',', $.expression)),
      ')',
    ),

    // 8.5 Slice names

    slice_name: $ => seq(
      $.prefix,
      '(',
      $.discrete_range,
      ')'
    ),

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

    conditional_expression: $ => prec.right(seq(
      $.expression,
      repeat(seq('when', $.condition, 'else', $.expression))
    )),

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

    term: $ => prec.left(seq(
      $.factor,
      repeat(seq($.expression_or_unaffected, $.factor))
    )),

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

    primary: $ => prec(1,choice(
      $._name,
      $.literal,
      $.aggregate,
      $.function_call,
      $.qualified_expression,
      $.type_conversion,
      $.allocator,
      seq('(', $.conditional_expression, ')')
    )),

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
      $._numeric_literal,
      //$.enumeration_literal,
      //$.string_literal,
      //$.bit_string_literal,
      'null'
    ),

    _numeric_literal: $ => prec(1, choice(
      $.abstract_literal,
      $.physical_literal
    )),

    // 9.3.3 Aggregates
    aggregate: $ => seq(
      '(',
      $.element_association,
      repeat(seq(',',  $.element_association )),
      ')'
    ),

    element_association: $ => prec(1,seq(
      optional(seq($.choices, '=>')),
      $.expression
    )),

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
    function_call: $ => prec.right(seq(
      $.function_name,
//      $.function_name,
      //optional(generic_map_aspect),
      //optional(parameter_map_aspect)
    )),

    parameter_map_aspect: $ => seq(
      optional(seq('parameter', 'map')),
      '(',
//      $.parameter_association_list,
      ')',
    ),

    // 9.3.5 Qualified expressions
    qualified_expression: $ => choice(
      seq($._type_mark, "'", '(', $.expression, ')'),
      seq($._type_mark, "'", $.aggregate),
      seq($._type_mark, "'", '(', ')'),
    ),

    // 9.3.6 Type conversions
    type_conversion: $ => seq($._type_mark, '(', $.expression, ')'),

    // 9.3.7 Allocators
    allocator: $ => choice(
      //seq('new', $.subtype_indication, optional($.generic_map_aspect)),
      seq('new', $.qualified_expression)
    ),

    // ########################################################################
    // 12 Scope and visibility
    // ########################################################################

    // 12.4 Use clauses

    use_clause: $ => seq(
      'use',
      $.selected_name,
      repeat(seq(',', $.selected_name)),
      $._semicolon
    ),

    // ########################################################################
    // 13 Design units and their analysis
    // ########################################################################

    // 13.1 Design units

    _design_file: $ => prec.right(repeat1($._design_unit)),

    _design_unit: $ => seq(
      optional($.context_clause),
      $._library_unit
    ),

    _library_unit: $ => choice(
      $._primary_unit,
    //  $.secondary_unit
    ),

    _primary_unit: $ => choice(
      $.entity_declaration,
    //  $.configuration_declaration,
    //  $.package_declaration,
    //  $.package_instantiation_declaration,
      $.context_declaration,
    //  //$.PSL_verification_unit
    ),

    //secondary_unit: $ => choice(
    //  $.architecture_body,
    //  $.package_body
    //),

    // 13.2 Design libraries

    library_clause: $ => seq(
      'library',
      $.logical_name_list,
      $._semicolon
    ),

    logical_name_list: $=> seq(
      $._logical_name,
      repeat(seq(',', $._logical_name))
    ),

    _logical_name: $ => $._identifier,

    // 13.3 Context declarations

    context_declaration: $ => seq(
      'context',
      $._identifier,
      'is',
      $.context_clause,
      'end',
      optional('context'),
      optional($._context_simple_name),
      $._semicolon
    ),

    // 13.4 Context clauses
    context_clause: $ => prec.left(repeat1(
      $.context_item
    )),

    context_item: $ => choice(
      $.library_clause,
      $.use_clause,
      $.context_reference
    ),

    context_reference: $ => seq(
      'context',
      $.selected_name,
      repeat(seq(',', $.selected_name)),
      $._semicolon
    ),

    //incomplete_type_declaration: $ => seq(
    //),
    
    // ########################################################################
    // 15 Lexical elements
    // ########################################################################

    // 15.2 Character set
    basic_graphic_character: $ => choice(
      $.upper_case_letter,
      $.digit,
    //  $.special_character,
    //  $.space_character
    ),

    upper_case_letter: $ => /[A-Z]/,

    _graphic_character: $ => choice(
      $.basic_graphic_character,
      $.lower_case_letter,
      //$.other_special_character
    ),

    digit: $ => /\d/,

    lower_case_letter: $ => /[a-z]/,

    // 15.4 Identifiers

    _identifier: $ => choice(
      $.basic_identifier,
      $.extended_identifier,
    ),

    basic_identifier: $ => /([A-Z]|[a-z])([A-Z]|[a-z]|[0-9]|_)*/,

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
      optional($.exponent)
    ),

    // TODO: Fix regex for 123_12312_, '_' is not allowed at the end.
    integer: $ => /\d([\d|_])*/,

    exponent: $ => token.immediate(/[E|e][\+-]?\d(\d|_)*/),

    // 15.6 Character literals

    character_literal: $ => seq('\'', $._graphic_character, '\''),

    // 15.7 String literals

    string_literal: $ => seq('"', repeat($._graphic_character), '"'),

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
