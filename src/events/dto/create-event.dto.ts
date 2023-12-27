export class CreateEventDto {
    name: string;
    device: { id: string; name: string };
    cooldown: number;
    filterSongs: boolean;
}
