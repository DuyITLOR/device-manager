import { Controller, Get, Post, Patch, Delete, Param, Body } from "@nestjs/common";
import { ROLES, Role } from "../../shared/constants";
import { Roles, CurrentUser} from "../../common/decorators"
import { UsersService } from './users.service';
import { createUserDto } from './dto/createUser.dto';
import { updateUserDto } from './dto/updateUser.dto';
import { changePasswordDto } from './dto/changePassword.dto';
import { updateRoleDto } from './dto/updateRole.dto';

@Controller('users')
export class UsersController 
{
    constructor(private readonly users: UsersService){}
    @Roles(ROLES.ADMIN, ROLES.MANAGER)
    @Get()
    findAll(){
        return this.users.findAll();
    }

    @Roles(ROLES.ADMIN, ROLES.MANAGER)
    @Get(':id')
    findOne(@Param('id') id: string)
    {
        return this.users.findOne(id);
    }

    @Roles(ROLES.ADMIN, ROLES.MANAGER)
    @Post()
    create(@Body()  dto: createUserDto){
        return this.users.create(dto);
    }


    @Patch(':id')
    updateProfile(
        @Param('id') id: string,
        @Body() dto: updateUserDto,
        @CurrentUser() me: { id: string; role: Role },
    ){
        return this.users.updateProfile(id, dto, me);
    }

    @Patch(':id/change-password')
    changePassword(
        @Param('id') id: string,
        @Body() dto: changePasswordDto,
        @CurrentUser() me: { id: string; role: Role },
    ){
        return this.users.changePassword(id, dto, me);
    }

    @Roles(ROLES.ADMIN)
    @Patch(':id/role')
    updateRole(@Param('id') id: string, @Body() dto: updateRoleDto) {
      return this.users.updateRole(id, dto);
    }
  
    @Roles(ROLES.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.users.delete(id);
    }

}