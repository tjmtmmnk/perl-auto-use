package Hoge::Piyo;

use Exporter 'import';
our @EXPORT = get_public_functions;

sub create_piyo {
    print 'create';
}

sub piyo_piyo {
    print 'piyopiyo';
}

sub _args_pos {
    print('private so not exported');
}