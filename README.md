# auto-use
vscode extention for perl auto use

## Style
- This extension conforms to Perl's style guide (https://perldoc.perl.org/perlstyle.html)
  - Subroutine is all lowercase
  - No space between function name and opening parenthesis
  - No space before semicolon
  - Module is PascalCase

## Setting
- `filesToScan`: Perl module directory for scanning
  - Multiple directory can be specified
    - Separate with white space
    - For cpan module and test module etc

## Plan
### v1
- complement `use` function automatically without executing commands
- specify the directory for forecast functions
- only forecast target exported by `Exporter` Module (`@EXPORT,@EXPORT_OK`)
  - does not work well if a function to get a function name in package is specified
    - e.g) https://metacpan.org/pod/Module::Functions

### v2
- coressponding to a function to get a function name in package

- cache the function forecast options
