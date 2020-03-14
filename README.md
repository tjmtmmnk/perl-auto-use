# auto-use
vscode extention for perl auto use

## Naming Rule
- This extension conforms to Perl's naming rule (https://perldoc.perl.org/perlstyle.html)
  - Subroutine is all lowercase
  - No space between function name and opening parenthesis
  - No space before semicolon
  - Module is PascalCase

## Plan
### v1
- select function which want to use and execute command for `use` the function
- specify the directory for forecast functions

### v2
- complement `use` function automatically without executing commands
- cache the function forecast options
