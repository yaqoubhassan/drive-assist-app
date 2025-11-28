<?php

namespace Database\Seeders;

use App\Models\VehicleMake;
use App\Models\VehicleModel;
use Illuminate\Database\Seeder;

class VehicleMakeSeeder extends Seeder
{
    public function run(): void
    {
        $makes = [
            'Toyota' => ['Japan', ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Land Cruiser', 'Prado', 'Hilux', 'Yaris', 'Avalon', 'Venza', 'Fortuner', '4Runner', 'Tundra', 'Sienna']],
            'Honda' => ['Japan', ['Accord', 'Civic', 'CR-V', 'Pilot', 'HR-V', 'Fit', 'Odyssey', 'Passport', 'Ridgeline']],
            'Hyundai' => ['South Korea', ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Accent', 'Kona', 'Palisade', 'Venue']],
            'Kia' => ['South Korea', ['Optima', 'Sportage', 'Sorento', 'Forte', 'Rio', 'Seltos', 'Telluride', 'Carnival']],
            'Nissan' => ['Japan', ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Murano', 'Maxima', 'Kicks', 'Armada', 'Titan']],
            'Mercedes-Benz' => ['Germany', ['C-Class', 'E-Class', 'S-Class', 'GLE', 'GLC', 'GLA', 'GLB', 'A-Class', 'AMG GT']],
            'BMW' => ['Germany', ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7', 'X1', '4 Series', 'M3', 'M5']],
            'Ford' => ['USA', ['F-150', 'Explorer', 'Escape', 'Fusion', 'Mustang', 'Edge', 'Bronco', 'Ranger', 'Expedition']],
            'Chevrolet' => ['USA', ['Malibu', 'Equinox', 'Traverse', 'Tahoe', 'Suburban', 'Silverado', 'Camaro', 'Corvette', 'Blazer']],
            'Volkswagen' => ['Germany', ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf', 'Arteon', 'ID.4', 'Taos']],
            'Audi' => ['Germany', ['A4', 'A6', 'A8', 'Q5', 'Q7', 'Q8', 'A3', 'e-tron', 'RS6']],
            'Lexus' => ['Japan', ['ES', 'RX', 'NX', 'GX', 'LX', 'IS', 'LS', 'UX', 'LC']],
            'Mazda' => ['Japan', ['Mazda3', 'Mazda6', 'CX-5', 'CX-9', 'CX-30', 'MX-5 Miata', 'CX-50']],
            'Subaru' => ['Japan', ['Outback', 'Forester', 'Crosstrek', 'Impreza', 'Legacy', 'Ascent', 'WRX', 'BRZ']],
            'Mitsubishi' => ['Japan', ['Outlander', 'Eclipse Cross', 'Pajero', 'ASX', 'L200', 'Mirage']],
            'Suzuki' => ['Japan', ['Swift', 'Vitara', 'Jimny', 'S-Cross', 'Baleno', 'Celerio', 'Alto']],
            'Peugeot' => ['France', ['208', '308', '508', '2008', '3008', '5008', 'Partner']],
            'Renault' => ['France', ['Clio', 'Megane', 'Captur', 'Kadjar', 'Koleos', 'Duster', 'Kwid']],
            'Land Rover' => ['UK', ['Range Rover', 'Range Rover Sport', 'Discovery', 'Defender', 'Evoque', 'Velar']],
            'Jeep' => ['USA', ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator']],
            'Volvo' => ['Sweden', ['XC90', 'XC60', 'XC40', 'S60', 'S90', 'V60', 'V90']],
            'Porsche' => ['Germany', ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Boxster', 'Cayman']],
            'Tesla' => ['USA', ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck']],
            'Isuzu' => ['Japan', ['D-Max', 'MU-X', 'Trooper', 'NPR', 'NQR']],
            'JAC' => ['China', ['S2', 'S3', 'S4', 'S7', 'T6', 'T8']],
            'Chery' => ['China', ['Tiggo 4', 'Tiggo 7', 'Tiggo 8', 'Arrizo 5', 'Arrizo 6']],
            'Geely' => ['China', ['Coolray', 'Azkarra', 'Emgrand', 'Okavango']],
            'BYD' => ['China', ['Atto 3', 'Han', 'Tang', 'Seal', 'Dolphin']],
            'Mahindra' => ['India', ['XUV700', 'Scorpio', 'Thar', 'Bolero', 'XUV300']],
            'Tata' => ['India', ['Nexon', 'Harrier', 'Safari', 'Punch', 'Tiago']],
        ];

        foreach ($makes as $makeName => [$country, $models]) {
            $make = VehicleMake::updateOrCreate(
                ['slug' => \Str::slug($makeName)],
                ['name' => $makeName, 'country_of_origin' => $country]
            );

            foreach ($models as $modelName) {
                VehicleModel::updateOrCreate(
                    ['vehicle_make_id' => $make->id, 'slug' => \Str::slug($modelName)],
                    ['name' => $modelName, 'type' => 'sedan']
                );
            }
        }
    }
}
