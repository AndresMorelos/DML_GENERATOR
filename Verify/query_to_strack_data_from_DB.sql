declare
    json varchar(4000);
begin
    json := '[';
    
    for loop_data in (select id_employer, cd_stripe_token from employer where cd_stripe_token is not null)
    loop
        json := json || '{ "id": '|| loop_data.id_employer || ',"token": "' || loop_data.cd_stripe_token||'"},';
    end loop;
    json := json || ']';
    print(json);
end;