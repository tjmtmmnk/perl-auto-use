# perl-auto-use 
![automation](https://user-images.githubusercontent.com/31027514/77855649-aa544b80-722c-11ea-9de8-bfe20e23079a.png)

<div>Icons made by <a href="https://www.flaticon.com/authors/good-ware" title="Good Ware">Good Ware</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>

![](https://img.shields.io/github/workflow/status/tjmtmmnk/perl-auto-use/vscode-test)
![](https://img.shields.io/github/issues/tjmtmmnk/perl-auto-use)
![](https://img.shields.io/github/issues-pr/tjmtmmnk/perl-auto-use)
![](https://img.shields.io/github/license/tjmtmmnk/perl-auto-use)

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

## Commands

- `Scan perl module files`
    - Scan Perl module files for subsequent auto-using.
- `Auto use (exec after scanning)`
    - Add module dependency declarations by `use` function.


Check details by a gif animated image below:

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
