package AutoUse;
use Smart::Args::TypeTiny qw(args_pos);
use Hoge::Piyo qw(create_piyo piyo_piyo);
use Hoge::Fuga;

sub new_from_name {
    args_pos my $class => 'Class',
             my $name  => 'Str',
    ;
    create_piyo;
    print('}

sub song {
    Hoge::Fuga->song;
    piyo_piyo(times => 2);
    print('
}

sub walk {
    args my $class => 'Class',
         my $stride => 'Int',
    ;
    print('args is duplicate. so not used')
}