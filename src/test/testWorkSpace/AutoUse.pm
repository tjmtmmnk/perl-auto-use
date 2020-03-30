package AutoUse;
use Smart::Args::TypeTiny qw(args_pos);
use Hoge::Piyo qw(create_piyo my_name piyo_piyo);
use Hoge::Fuga;

# check_type is not used
sub new_from_name {
    args_pos my $class => 'Class',
             my $name  => 'Str',
    ;

    my $piyo = create_piyo;

    my $hash = {
        types => 'types is exported but hash key',
    };
}

# check_rule is not used
sub song {
    Hoge::Fuga->song;
    my $sing = piyo_piyo(times => 2);
    my $name = my_name;
}

sub walk {
    args my $class => 'Class',
         my $stride => 'Int',
    ;
    print('args is duplicate. so not used')
}