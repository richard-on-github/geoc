import type {Request, Response, NextFunction} from "express";
import {roleService} from "./role.service.js";
import {successResponse} from "../../utils/response.js";
import {HTTP_STATUS} from "../../constants/http-status.js";
import type {
    RoleQueryParams,
    CreateRoleInput,
    UpdateRoleInput, RoleAllQueryParams,
} from "./role.interface.js";

export const roleController = {
    async findAll(req: Request, res: Response, next: NextFunction) {
        const query = req.query as unknown as RoleQueryParams;
        const result = await roleService.getAll(query);
        successResponse(res, HTTP_STATUS.OK, "Rôles récupérés avec succès", result);
    },

    async findAllWithoutPagination(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        const query = req.query as unknown as RoleAllQueryParams;
        const result = await roleService.getAllWithoutPagination(query);
        successResponse(
            res,
            HTTP_STATUS.OK,
            "Liste des rôles (simplifiée) récupérée avec succès",
            result
        );
    },

    async findById(
        req: Request<{ id: string }>,
        res: Response,
        next: NextFunction,
    ) {
        const {id} = req.params;
        const role = await roleService.getById(id);
        successResponse(res, HTTP_STATUS.OK, "Rôle récupéré avec succès", role);
    },

    async create(req: Request, res: Response, next: NextFunction) {
        const input: CreateRoleInput = req.body;

        const actor = {
            id: req.user!.id,
            agenceId: req.user?.agenceId,
            niveau: req.user?.role?.niveau ?? 0,
        };

        const role = await roleService.create(input, actor, req.ip);
        successResponse(res, HTTP_STATUS.CREATED, "Rôle créé avec succès", role);
    },

    async update(
        req: Request<{ id: string }>,
        res: Response,
        next: NextFunction,
    ) {
        const {id} = req.params;
        const input: UpdateRoleInput = req.body;

        const actor = {
            id: req.user!.id,
            agenceId: req.user?.agenceId,
            niveau: req.user?.role?.niveau ?? 0,
        };

        const role = await roleService.update(id, input, actor, req.ip);
        successResponse(res, HTTP_STATUS.OK, "Rôle mis à jour avec succès", role);
    },

    async delete(
        req: Request<{ id: string }>,
        res: Response,
        next: NextFunction,
    ) {
        const {id} = req.params;

        const actor = {
            id: req.user!.id,
            agenceId: req.user?.agenceId,
            niveau: req.user?.role?.niveau ?? 0,
        };

        await roleService.delete(id, actor, req.ip);
        successResponse(res, HTTP_STATUS.OK, "Rôle supprimé avec succès", null);
    },
};
