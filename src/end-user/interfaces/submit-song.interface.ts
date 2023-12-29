export interface SubmitSongDto {
    song: SongDto;
    eventId: string;
    userId: string;
}
export interface SongDto {
    id: string;
    name: string;
    artists: string;
    image: string;
}
