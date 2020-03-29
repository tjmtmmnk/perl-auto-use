# perl-auto-use
![](https://github.com/tjmtmmnk/perl-auto-use/workflows/vscode-test/badge.svg)

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

## Sample
![test](https://user-images.githubusercontent.com/31027514/77447249-d178da80-6e32-11ea-860f-e982c8b0570e.gif)

## Plan
### v1
- complement `use` function automatically without executing commands
- specify the directory for forecast functions
- only forecast target exported by `Exporter` Module (`@EXPORT,@EXPORT_OK`)
  - does not work well if a function to get a function name in package is specified
    - e.g) https://metacpan.org/pod/Module::Functions

### v2 (now)
- coressponding to a function to get a function name in package

### v3
- cache the function forecast options
